'use strict';

function summaryVersionError(body) {
  if (body && body.reportVersion !== undefined && body.reportVersion !== 2) {
    return {
      success: false,
      code: 'INTERVIEW_REPORT_CLIENT_OUTDATED',
      message: 'Bản luyện phỏng vấn đã được cập nhật. Hãy lưu hoặc sao chép hội thoại hiện tại trước khi tải lại trang để nhận báo cáo mới.'
    };
  }
  return null;
}

function findSourceQuestion(questionText, questionId, bank, allRecords) {
  if (questionId) {
    const byId = bank.getQuestion(questionId);
    if (byId) return byId;
  }
  const cleanText = String(questionText || '').trim();
  if (!cleanText) return null;
  const exactOrSuffix = allRecords.find(row =>
    cleanText === row.question ||
    cleanText.endsWith(' ' + row.question) ||
    cleanText.endsWith(': ' + row.question) ||
    cleanText.includes(row.question)
  );
  return exactOrSuffix || null;
}

function answeredPairs(history) {
  const bank = require('./interviewQuestionBank');
  const records = require('../../assets/interview-bank/seed.json').records;
  const policy = require('./interviewTurnPolicy');
  const pairs = [];
  let question = '';
  let questionId = '';

  let lastWasHint = false;
  for (const turn of history.slice(-40)) {
    if (!turn || typeof turn !== 'object') continue;
    const text = String(turn.message ?? turn.content ?? '').trim();
    if (!text) continue;
    const isInterviewer = turn.role === 'interviewer' || turn.role === 'assistant';
    if (isInterviewer) {
      if (lastWasHint && question) {
        if (turn.questionId) questionId = turn.questionId;
        lastWasHint = false;
      } else {
        question = text;
        questionId = turn.questionId || '';
      }
    } else if (question) {
      const source = findSourceQuestion(question, questionId, bank, records);
      const intent = policy.detectTurnIntent(text);
      if (intent.type === 'hint') {
        // Hint request is not a final answer to score; wait for subsequent answer on the same question
        lastWasHint = true;
        continue;
      }
      lastWasHint = false;
      pairs.push({
        answerId: 'answer-' + (pairs.length + 1),
        question: source?.question || question,
        candidateAnswer: text,
        ...(source ? {
          questionId: source.id,
          answerType: source.answerType,
          level: source.level,
          keyPoints: source.keyPoints || [],
          redFlags: source.redFlags || []
        } : {}),
        ...(intent.type !== 'answer' ? { skipped: true } : {})
      });
      question = '';
      questionId = '';
    } else if (pairs.length && !pairs[pairs.length - 1].skipped) {
      pairs[pairs.length - 1].candidateAnswer += '\n' + text;
    }
  }
  return pairs;
}

function groundSummary(result, pairs) {
  if (!pairs.length) throw Error('No answered interview turns');
  const bank = require('./interviewQuestionBank');
  const { groundEvaluation, analyzeAnswerAgainstRubric, computeUnifiedScore } = require('./interviewEvaluationService');
  const rows = Array.isArray(result?.qaBreakdown) ? result.qaBreakdown : [];

  const qaBreakdown = pairs.map(pair => {
    const source = pair.questionId ? bank.getQuestion(pair.questionId) : null;
    const modelMatch = rows.find(row => row && row.answerId === pair.answerId) || null;
    const effectiveLevel = source?.level || pair.level || '';

    if (pair.skipped) {
      return {
        ...pair,
        score: null,
        ratingBand: 'Đã bỏ qua',
        status: 'skipped',
        suggestedStarAnswer: null,
        strengths: [],
        verifiedComponents: [],
        rejectedComponents: source?.keyPoints ? source.keyPoints.map(kp => `Chưa trả lời ý trọng tâm: ${kp}`) : [],
        followUpQuestions: [],
        keyPoints: source?.keyPoints || [],
        redFlags: source?.redFlags || [],
        referenceAnswer: source?.answerSample || '',
        critique: source?.keyPoints?.length
          ? `Bạn đã bỏ qua câu hỏi này. Khi luyện lại, hãy tập trung làm rõ: ${source.keyPoints.join('; ')}.`
          : 'Đã bỏ qua hoặc chưa có câu trả lời cho câu hỏi này.'
      };
    }

    // Behavioral question: combine optional model row with deterministic STAR + rubric + anti-fabrication grounding
    if (pair.answerType === 'behavioral') {
      const grounded = groundEvaluation(modelMatch, {
        question: pair.question,
        candidateAnswer: pair.candidateAnswer,
        answerType: 'behavioral',
        level: effectiveLevel,
        keyPoints: source?.keyPoints || [],
        redFlags: source?.redFlags || [],
        referenceAnswer: source?.answerSample || ''
      });
      return {
        ...pair,
        status: 'evaluated',
        score: grounded.score,
        ratingBand: grounded.ratingBand,
        scoreNote: grounded.scoreNote,
        suggestedStarAnswer: grounded.suggestedStarAnswer,
        verifiedComponents: grounded.verifiedComponents,
        rejectedComponents: grounded.rejectedComponents,
        strengths: grounded.strengths,
        followUpQuestions: grounded.followUpQuestions,
        keyPoints: source?.keyPoints || [],
        redFlags: source?.redFlags || [],
        referenceAnswer: source?.answerSample || grounded.improvedAnswer,
        practiceTask: grounded.practiceTask,
        critique: grounded.critique
      };
    }

    // Scenario, Knowledge, or Freeform question: unified rubric + anti-fabrication + optional model calibration!
    const det = analyzeAnswerAgainstRubric({
      question: pair.question,
      candidateAnswer: pair.candidateAnswer,
      answerType: pair.answerType || 'scenario',
      level: effectiveLevel,
      keyPoints: source?.keyPoints || [],
      redFlags: source?.redFlags || [],
      referenceAnswer: source?.answerSample || ''
    });
    const isFabricated = Boolean(det.fabricationDetected || modelMatch?.fabricationDetected === true);
    const unifiedScore = computeUnifiedScore(det, modelMatch);
    const unifiedBand = unifiedScore >= 8.0 ? 'Tốt' : (unifiedScore >= 6.5 ? 'Khá' : (unifiedScore >= 4.5 ? 'Trung bình' : 'Yếu'));
    const verifiedOut = isFabricated ? [] : det.verifiedComponents;
    const rejectedOut = (isFabricated && !det.fabricationDetected)
      ? ['Dấu hiệu phóng đại thành tích hoặc nêu số liệu thiếu cơ sở kiểm chứng thực tế', ...det.rejectedComponents]
      : det.rejectedComponents;

    return {
      ...pair,
      status: 'evaluated',
      score: unifiedScore,
      ratingBand: unifiedBand,
      scoreNote: 'Điểm đối chiếu trực tiếp câu trả lời của bạn với các ý trọng tâm (keyPoints), lỗi cần tránh (redFlags) và tính khả tín của dữ kiện.',
      suggestedStarAnswer: null,
      strengths: (!isFabricated && unifiedScore >= 6.5) ? verifiedOut.slice(0, 3) : [],
      verifiedComponents: verifiedOut,
      rejectedComponents: rejectedOut,
      followUpQuestions: det.followUpQuestions,
      keyPoints: source?.keyPoints || [],
      redFlags: source?.redFlags || [],
      referenceAnswer: source?.answerSample || '',
      critique: (isFabricated && !det.fabricationDetected)
        ? 'Câu trả lời có dấu hiệu phóng đại hoặc nêu số liệu thiếu cơ sở kiểm chứng thực tế. Hãy trình bày lại bằng dự án thật, số liệu gốc (baseline) và cách đo lường cụ thể.'
        : det.critique,
      referenceNotice: 'Đáp án mẫu dùng để đối chiếu phương pháp lập luận; hãy trình bày bằng trải nghiệm thực tế của bạn.'
    };
  });

  const scoredRows = qaBreakdown.filter(row => typeof row.score === 'number' && Number.isFinite(row.score));
  const skippedCount = qaBreakdown.filter(row => row.status === 'skipped').length;

  let overallScore = null;
  if (scoredRows.length > 0) {
    const rawAvg = scoredRows.reduce((sum, row) => sum + row.score, 0) / scoredRows.length;
    // Honest adjustment if candidate skipped more than half of the attempted turns
    const answeredRatio = scoredRows.length / qaBreakdown.length;
    const adjusted = answeredRatio < 0.5 ? rawAvg * (0.75 + answeredRatio * 0.5) : rawAvg;
    overallScore = Math.round(adjusted * 10) / 10;
  }

  // Honest strengths (ZERO fake praise when all skipped or all weak!)
  const collectedStrengths = [];
  qaBreakdown.forEach((row, idx) => {
    if (typeof row.score === 'number' && row.score >= 6.5 && row.verifiedComponents?.length > 0) {
      collectedStrengths.push(`Câu ${idx + 1} (${row.score}/10): ${row.verifiedComponents[0]}`);
    }
  });

  // Actionable, question-specific improvements
  const collectedImprovements = [];
  qaBreakdown.forEach((row, idx) => {
    if (row.status === 'skipped') {
      const kp = row.keyPoints?.[0] ? ` (cần nắm: ${row.keyPoints[0]})` : '';
      collectedImprovements.push(`Câu ${idx + 1}: Đã bỏ qua — xem đáp án mẫu bên dưới để bổ sung kiến thức${kp}.`);
    } else if (row.rejectedComponents?.length > 0) {
      collectedImprovements.push(`Câu ${idx + 1} (${row.score}/10): ${row.rejectedComponents[0]}`);
    } else if (row.followUpQuestions?.length > 0 && row.score < 8.5) {
      collectedImprovements.push(`Câu ${idx + 1}: ${row.followUpQuestions[0]}`);
    }
  });

  let rating = 'Chưa đủ dữ liệu chấm điểm';
  if (overallScore !== null) {
    if (overallScore >= 8.5) rating = 'Xuất sắc';
    else if (overallScore >= 7.0) rating = 'Khá / Tốt';
    else if (overallScore >= 5.0) rating = 'Trung bình (Cần bổ sung chiều sâu)';
    else rating = 'Yếu (Cần luyện tập lại cách lập luận)';
  }

  let finalAdvice = '';
  if (overallScore === null) {
    finalAdvice = 'Bạn đã bỏ qua tất cả các câu hỏi trong phiên này nên hệ thống không chấm điểm khống. Hãy đọc kỹ phần Trọng tâm cần nêu & Đáp án mẫu của từng câu bên dưới, sau đó bấm Luyện Tập Lại và tự diễn đạt bằng lời của mình.';
  } else if (overallScore < 5.0) {
    finalAdvice = 'Các câu trả lời hiện còn quá ngắn hoặc cảm tính, chưa chạm vào quy trình xử lý và tiêu chí kiểm chứng mà HR tìm kiếm. Hãy xem chi tiết các ý bị thiếu (Rejected/Missing) ở từng câu bên dưới và tập trả lời theo cấu trúc Nguyên nhân → Hành động cụ thể → Kết quả thực tế.';
  } else if (overallScore < 7.5) {
    finalAdvice = 'Bạn đã nắm được hướng xử lý cơ bản nhưng còn bỏ sót một số điều kiện biên, đánh đổi rủi ro hoặc kết quả đo lường cụ thể. Hãy rà lại các ý còn thiếu trong từng câu bên dưới để nâng mức điểm lên 8+.';
  } else {
    finalAdvice = 'Lập luận của bạn bám sát trọng tâm chuyên môn và có hành động thực chứng rõ ràng. Khi vào phỏng vấn thật, hãy chuẩn bị sẵn 1–2 số liệu thực tế từ dự án của bạn để sẵn sàng cho các câu hỏi đào sâu của Hiring Manager.';
  }

  return {
    qaBreakdown,
    overallScore,
    scoreNote: 'Điểm số là ước lượng tham khảo dựa trên đối chiếu câu trả lời với các tiêu chí trọng tâm (keyPoints & STAR), không phải quyết định tuyển dụng chính thức.',
    strengths: collectedStrengths.slice(0, 6),
    improvements: collectedImprovements.slice(0, 8),
    finalAdvice,
    rating,
    summary: overallScore === null
      ? `Phiên gồm ${pairs.length} câu hỏi và cả ${skippedCount} câu đều được bỏ qua/chưa trả lời, vì vậy hệ thống giữ nguyên trạng thái chưa chấm điểm.`
      : `Đã đánh giá ${scoredRows.length}/${pairs.length} câu trả lời thực tế${skippedCount ? ` (${skippedCount} câu bỏ qua không tính điểm khống)` : ''}, điểm trung bình đạt ${overallScore}/10 (${rating}).`
  };
}

function needsModel(pair) {
  return !pair.skipped;
}

module.exports = { answeredPairs, groundSummary, summaryVersionError, needsModel };
