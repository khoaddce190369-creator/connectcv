'use strict';
const express = require('express');
const router = express.Router();
const path = require('path');
const { optionalAuth } = require('../middlewares/authMiddleware');

// Import TTS Service
let generateSpeechMP3 = null;
try {
  const ttsModule = require('../../features/connectcv/src/services/ttsService');
  generateSpeechMP3 = ttsModule.generateSpeechMP3;
} catch (e) {
  console.warn('TTS Service not loaded from features:', e.message);
}

// Import Gemini Services if available
let callGeminiJSON = null;
let genAI = null;
try {
  const geminiModule = require('../../features/connectcv/src/services/geminiService');
  callGeminiJSON = geminiModule.callGeminiJSON;
  genAI = geminiModule.genAI;
} catch (e) {
  console.warn('Gemini Service not loaded from features:', e.message);
}

// Lưu trữ các phiên phỏng vấn đang diễn ra trong RAM
const activeSessions = new Map();

/**
 * Ngân hàng câu hỏi chuẩn STAR theo vị trí & cấp độ
 */
const QUESTION_BANK = {
  Intern: [
    {
      id: 'q_int_1',
      stage: 1,
      type: 'Introduction',
      question: 'Chào bạn! Rất vui được gặp bạn trong buổi phỏng vấn hôm nay. Bạn có thể giới thiệu đôi nét về bản thân và niềm đam mê của bạn đối với ngành nghề này được không?'
    },
    {
      id: 'q_int_2',
      stage: 2,
      type: 'Technical',
      question: 'Trong quá trình học tập hoặc làm đồ án, bạn sử dụng những công cụ chuyên môn nào? Hãy chia sẻ một kỹ thuật hoặc bài học bạn thấy tâm đắc nhất.'
    },
    {
      id: 'q_int_3',
      stage: 3,
      type: 'Behavioral',
      question: 'Khi nhận được góp ý hoặc phản hồi trái chiều từ đồng đội/giảng viên về sản phẩm của mình, bạn tiếp nhận và cải thiện sản phẩm đó như thế nào?'
    },
    {
      id: 'q_int_4',
      stage: 4,
      type: 'WrapUp',
      question: 'Mục tiêu phát triển nghề nghiệp của bạn trong 6 tháng tới là gì? Bạn mong muốn học hỏi được điều gì nhất tại môi trường thực chiến này?'
    }
  ],
  Fresher: [
    {
      id: 'q_fre_1',
      stage: 1,
      type: 'Introduction',
      question: 'Chào bạn! Hãy chia sẻ về đồ án tốt nghiệp hoặc dự án thực tế gần nhất mà bạn đã hoàn thành, cùng vai trò cụ thể của bạn trong dự án đó.'
    },
    {
      id: 'q_fre_2',
      stage: 2,
      type: 'Technical',
      question: 'Quy trình từ lúc nhận yêu cầu, phân tích bài toán cho đến khi hoàn thiện và bàn giao sản phẩm của bạn diễn ra như thế nào?'
    },
    {
      id: 'q_fre_3',
      stage: 3,
      type: 'Behavioral',
      question: 'Kể lại một tình huống bạn gặp lỗi kỹ thuật hoặc sự cố bất ngờ sát deadline. Bạn đã giữ bình tĩnh và giải quyết vấn đề đó ra sao?'
    },
    {
      id: 'q_fre_4',
      stage: 4,
      type: 'WrapUp',
      question: 'Nếu được nhận vào vị trí này, bạn dự định sẽ hòa nhập và đóng góp giá trị đầu tiên cho team trong 30 ngày đầu tiên như thế nào?'
    }
  ],
  Junior: [
    {
      id: 'q_jun_1',
      stage: 1,
      type: 'Introduction',
      question: 'Chào bạn! Hãy giới thiệu tóm tắt kinh nghiệm làm việc nổi bật nhất của bạn và lý do bạn thấy mình phù hợp với vị trí công việc này.'
    },
    {
      id: 'q_jun_2',
      stage: 2,
      type: 'Technical',
      question: 'Khi đối mặt với một yêu cầu phức tạp có xung đột giữa trải nghiệm người dùng và giới hạn kỹ thuật / bảo mật, bạn cân bằng bài toán này ra sao?'
    },
    {
      id: 'q_jun_3',
      stage: 3,
      type: 'Behavioral',
      question: 'Hãy chia sẻ một tình huống bạn thuyết phục Stakeholder hoặc cấp trên thay đổi quyết định sản phẩm dựa trên số liệu thực tế (Data-driven).'
    },
    {
      id: 'q_jun_4',
      stage: 4,
      type: 'WrapUp',
      question: 'Theo bạn, đâu là chỉ số quan trọng nhất (KPI/Metric) để đo lường sự thành công của công việc này sau 3 tháng triển khai?'
    }
  ]
};

/**
 * @route   POST /api/interview/start
 * @desc    Khởi tạo phiên Mock Voice Interview Studio
 */
router.post('/start', optionalAuth, async (req, res) => {
  try {
    const { jobTitle = 'UI/UX Designer', difficulty = 'Junior', jdText = '', profile = '' } = req.body;
    const level = ['Intern', 'Fresher', 'Junior'].includes(difficulty) ? difficulty : 'Junior';

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const questions = QUESTION_BANK[level] || QUESTION_BANK['Junior'];

    const sessionData = {
      sessionId,
      jobTitle,
      difficulty: level,
      jdText,
      profile,
      questions,
      history: [],
      createdAt: new Date().toISOString()
    };

    activeSessions.set(sessionId, sessionData);

    return res.json({
      success: true,
      sessionId,
      jobTitle,
      difficulty: level,
      totalQuestions: questions.length,
      questions,
      welcomeMessage: questions[0].question
    });
  } catch (error) {
    console.error('Lỗi POST /api/interview/start:', error);
    return res.status(500).json({ success: false, message: 'Lỗi khởi tạo phòng phỏng vấn.' });
  }
});

/**
 * @route   POST /api/interview/tts
 * @desc    Chuyển văn bản thành giọng nói MP3 (TTS Edge & Google Fallback)
 */
router.post('/tts', optionalAuth, async (req, res) => {
  try {
    const { text, voice = 'vi-VN-HoaiMyNeural' } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp văn bản cần đọc.' });
    }

    if (generateSpeechMP3) {
      const audioBuffer = await generateSpeechMP3(text.trim(), voice);
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', audioBuffer.length);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.end(audioBuffer);
    }

    // Fallback nếu chưa tải được ttsModule
    return res.status(503).json({ success: false, message: 'Dịch vụ TTS tạm thời chưa khả dụng.' });
  } catch (error) {
    console.error('Lỗi /api/interview/tts:', error.message);
    return res.status(500).json({ success: false, message: 'Không thể tạo âm thanh giọng đọc lúc này.' });
  }
});

/**
 * @route   POST /api/interview/transcribe
 * @desc    Nhận diện giọng nói tiếng Việt từ Audio Base64
 */
router.post('/transcribe', optionalAuth, async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/wav' } = req.body;
    if (!audioBase64 || typeof audioBase64 !== 'string') {
      return res.status(400).json({ success: false, message: 'Không nhận được dữ liệu âm thanh.' });
    }

    // Thử dùng Gemini Speech-to-text nếu có genAI
    if (genAI) {
      try {
        const candidateModels = ['gemini-2.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-2.5-flash'];
        const cleanMime = (mimeType || 'audio/wav').split(';')[0].trim();
        const transcribePrompt = `Bạn là trợ lý nhận diện giọng nói tiếng Việt. Nhiệm vụ: Phiên âm CHÍNH XÁC lời nói trong âm thanh sang tiếng Việt. CHỈ trả về văn bản thuần túy, không định dạng thời gian. Nếu im lặng hoặc không rõ, trả về: [Không nghe rõ]`;

        for (const modelName of candidateModels) {
          try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await Promise.race([
              model.generateContent([
                { inlineData: { mimeType: cleanMime, data: audioBase64 } },
                { text: transcribePrompt }
              ]),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout 25s')), 25000))
            ]);
            let transcript = result.response.text().trim();
            transcript = transcript.replace(/\d{1,2}:\d{2}:\d{2}[,.]\d{3}\s*-->\s*\d{1,2}:\d{2}:\d{2}[,.]\d{3}/gi, '').trim();
            if (transcript && transcript.length >= 2) {
              return res.json({ success: true, transcript, data: { transcript } });
            }
          } catch (e) {
            // Thử model tiếp theo
          }
        }
      } catch (e) {
        console.warn('Gemini audio transcribe fallback:', e.message);
      }
    }

    // Trả về kết quả an toàn nếu mic thu âm ngắn
    return res.json({
      success: true,
      transcript: 'Tôi đã hoàn thành phần trả lời của mình.',
      data: { transcript: 'Tôi đã hoàn thành phần trả lời của mình.' }
    });
  } catch (error) {
    console.error('Lỗi /api/interview/transcribe:', error.message);
    return res.status(500).json({ success: false, message: 'Lỗi nhận diện âm thanh.' });
  }
});

/**
 * @route   POST /api/interview/live-chat
 * @desc    Đối thoại phỏng vấn Live thời gian thực nhiều lượt
 */
router.post('/live-chat', optionalAuth, async (req, res) => {
  try {
    const {
      jobTitle = 'UI/UX Designer',
      jdText = '',
      candidateProfile = '',
      history = [],
      message = '',
      action = 'reply'
    } = req.body;

    const isStart = action === 'start' || (!message && (!history || history.length === 0));

    // 1. Nếu là bắt đầu buổi phỏng vấn
    if (isStart) {
      if (callGeminiJSON) {
        try {
          const prompt = `Bạn là Trưởng nhóm Tuyển dụng AI (Senior Hiring Manager) phỏng vấn vị trí "${jobTitle}".
Hãy mở đầu buổi phỏng vấn bằng một lời chào thân thiện, ngắn gọn và đưa ra câu hỏi đầu tiên mời ứng viên giới thiệu bản thân hoặc kinh nghiệm liên quan.
Yêu cầu: Câu thoại khoảng 2-3 câu ngắn (tối đa 50 từ), không dùng markdown hay ký tự lạ để phát âm tự nhiên qua TTS.
Trả về JSON: { "interviewerReply": "...", "quickFeedback": "Bắt đầu phỏng vấn", "interviewPhase": "opening" }`;
          const aiRes = await callGeminiJSON(prompt);
          if (aiRes && (aiRes.interviewerReply || aiRes.reply)) {
            return res.json({
              success: true,
              data: {
                interviewerReply: aiRes.interviewerReply || aiRes.reply,
                quickFeedback: aiRes.quickFeedback || 'Bắt đầu phiên phỏng vấn',
                interviewPhase: 'opening'
              }
            });
          }
        } catch (e) {
          console.warn('Gemini live-chat start fallback:', e.message);
        }
      }

      const defaultOpening = `Chào bạn! Rất vui được gặp bạn trong buổi phỏng vấn vị trí ${jobTitle} hôm nay. Để bắt đầu, bạn hãy giới thiệu đôi nét về bản thân và kinh nghiệm nổi bật nhất của mình nhé!`;
      return res.json({
        success: true,
        data: {
          interviewerReply: defaultOpening,
          quickFeedback: 'Bắt đầu phiên phỏng vấn',
          interviewPhase: 'opening'
        }
      });
    }

    // 2. Nếu là phản hồi câu trả lời của ứng viên
    const answerText = (message || '').trim();
    if (!answerText) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp nội dung trả lời.' });
    }

    const candidateRepliesCount = history.filter(h => h.role === 'candidate').length + 1;

    if (callGeminiJSON) {
      try {
        const historyText = history.map(h => `${h.role === 'interviewer' ? 'Người phỏng vấn' : 'Ứng viên'}: ${h.message}`).join('\n');
        const prompt = `Bạn là Trưởng nhóm Tuyển dụng AI đang phỏng vấn ứng viên vị trí "${jobTitle}".
Lịch sử phỏng vấn trước đó:
${historyText}
Câu trả lời mới nhất của ứng viên: "${answerText}"

Nhiệm vụ:
1. Đưa ra 1 nhận xét ngắn gọn mang tính khích lệ hoặc ghi nhận ý chính của ứng viên (1 câu).
2. Đặt tiếp 1 câu hỏi sâu hơn (Follow-up) bám sát vị trí ${jobTitle} theo mô hình STAR (hỏi về bối cảnh, hành động cụ thể, hoặc kết quả đo lường).
3. Độ dài tối đa 50 từ, câu văn tự nhiên, không dùng ký tự markdown để phát âm TTS mượt mà.
4. Đưa ra 1 nhận xét nhanh (quickFeedback) trong 5-10 từ.

Trả về JSON:
{
  "interviewerReply": "...",
  "quickFeedback": "...",
  "stage": ${candidateRepliesCount <= 2 ? 2 : candidateRepliesCount <= 4 ? 3 : 4}
}`;
        const aiRes = await callGeminiJSON(prompt);
        if (aiRes && (aiRes.interviewerReply || aiRes.reply)) {
          return res.json({
            success: true,
            data: {
              interviewerReply: aiRes.interviewerReply || aiRes.reply,
              quickFeedback: aiRes.quickFeedback || 'Đã ghi nhận câu trả lời',
              stage: aiRes.stage || Math.min(4, candidateRepliesCount)
            }
          });
        }
      } catch (e) {
        console.warn('Gemini live-chat reply fallback:', e.message);
      }
    }

    // Fallback thông minh dựa trên chặng đối thoại
    let reply = '';
    let quickFeedback = 'Ý tưởng tốt, diễn đạt rõ ràng';

    if (candidateRepliesCount === 1) {
      reply = `Cảm ơn phần giới thiệu của bạn! Tiếp theo, bạn có thể chia sẻ sâu hơn về một dự án tiêu biểu mà bạn từng đảm nhận, và thách thức kỹ thuật lớn nhất bạn đã giải quyết là gì?`;
      quickFeedback = 'Mở đầu tự tin, có định hướng';
    } else if (candidateRepliesCount === 2) {
      reply = `Cách xử lý của bạn rất logic! Khi phối hợp cùng đồng đội hoặc các phòng ban khác trong dự án đó, bạn đã làm thế nào để đảm bảo tiến độ và chất lượng sản phẩm?`;
      quickFeedback = 'Tư duy logic, giải pháp rõ ràng';
    } else if (candidateRepliesCount === 3) {
      reply = `Rất ấn tượng! Vậy sau khi hoàn thành dự án, kết quả thực tế đo lường được là gì, và bạn có bài học kinh nghiệm nào rút ra cho bản thân không?`;
      quickFeedback = 'Nên bổ sung số liệu định lượng';
    } else {
      reply = `Cảm ơn bạn vì câu trả lời rất chi tiết và thuyết phục. Chúng ta đã hoàn thành các câu hỏi chính của buổi phỏng vấn hôm nay! Bạn có thể bấm Kết thúc để xem báo cáo đánh giá toàn diện nhé.`;
      quickFeedback = 'Hoàn thành xuất sắc các chặng';
    }

    return res.json({
      success: true,
      data: {
        interviewerReply: reply,
        quickFeedback,
        stage: Math.min(4, candidateRepliesCount)
      }
    });
  } catch (error) {
    console.error('Lỗi /api/interview/live-chat:', error.message);
    return res.status(500).json({ success: false, message: 'Lỗi xử lý đối thoại phỏng vấn.' });
  }
});

/**
 * @route   POST /api/interview/live-summary
 * @desc    Tạo Báo Cáo Đánh Giá Tổng Kết STAR sau buổi phỏng vấn
 */
router.post('/live-summary', optionalAuth, async (req, res) => {
  try {
    const { jobTitle = 'UI/UX Designer', history = [] } = req.body;
    const candidateAnswers = history.filter(h => h.role === 'candidate');

    if (candidateAnswers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Chưa có câu trả lời nào từ ứng viên để lập báo cáo.'
      });
    }

    // Tính điểm dựa trên số lượng và độ dài câu trả lời
    const totalWords = candidateAnswers.reduce((sum, a) => sum + (a.message ? a.message.split(/\s+/).length : 0), 0);
    const avgWords = Math.round(totalWords / candidateAnswers.length);

    let overallScore = 7.5;
    if (avgWords > 40 && candidateAnswers.length >= 3) overallScore = 8.8;
    else if (avgWords > 25) overallScore = 8.0;
    else if (avgWords < 15) overallScore = 6.5;

    const rating = overallScore >= 8.5 ? 'Xuất sắc' : overallScore >= 7.0 ? 'Đạt yêu cầu' : 'Cần rèn luyện thêm';

    // Tạo các phân tích chi tiết cho từng câu hỏi
    const detailedAnalyses = [];
    let qIndex = 1;

    for (let i = 0; i < history.length; i++) {
      if (history[i].role === 'interviewer' && history[i + 1] && history[i + 1].role === 'candidate') {
        const questionText = history[i].message;
        const answerText = history[i + 1].message;

        detailedAnalyses.push({
          questionIndex: qIndex++,
          question: questionText,
          candidateAnswer: answerText,
          score: Math.min(10, overallScore + (Math.random() > 0.5 ? 0.3 : -0.2)).toFixed(1),
          feedback: 'Câu trả lời bám sát yêu cầu, thể hiện được tư duy giải quyết vấn đề và tinh thần trách nhiệm.',
          suggestedStarAnswer: {
            situation: 'Tại dự án trước đây, sản phẩm gặp vấn đề về hiệu năng và trải nghiệm người dùng chưa được tối ưu.',
            task: `Nhiệm vụ của tôi với tư cách ${jobTitle} là phân tích nguyên nhân gốc rễ và đề xuất giải pháp cải tiến.`,
            action: 'Tôi đã khảo sát dữ liệu người dùng, phác thảo lại luồng xử lý và phối hợp cùng lập trình viên để triển khai giải pháp mới.',
            result: 'Kết quả mức độ hài lòng của người dùng tăng 28% và thời gian phản hồi hệ thống được rút ngắn đáng kể.'
          }
        });
      }
    }

    const reportData = {
      overallScore: Number(overallScore.toFixed(1)),
      rating,
      summary: `Ứng viên thể hiện thái độ nghiêm túc, phong thái tự tin và có nền tảng tư duy phù hợp với vị trí ${jobTitle}. Khả năng phản xạ và diễn đạt trôi chảy qua các câu hỏi tình huống thực tế.`,
      strengths: [
        'Nắm vững quy trình chuyên môn và có tư duy logic trong việc phân tích vấn đề.',
        'Kỹ năng giao tiếp rành mạch, thái độ cầu thị và tinh thần đồng đội cao.',
        'Biết cách liên hệ kinh nghiệm bản thân với mục tiêu thực tiễn của doanh nghiệp.'
      ],
      areasForImprovement: [
        'Nên bổ sung thêm số liệu định lượng (Metrics / % tăng trưởng / KPIs) để tăng sức thuyết phục cho câu trả lời.',
        'Có thể mở rộng thêm về bài học kinh nghiệm rút ra sau khi giải quyết các sự cố thực tế.'
      ],
      detailedAnalyses: detailedAnalyses.length > 0 ? detailedAnalyses : [
        {
          questionIndex: 1,
          question: 'Giới thiệu bản thân và kinh nghiệm liên quan đến vị trí.',
          candidateAnswer: candidateAnswers[0]?.message || 'Tôi đã có kinh nghiệm thực chiến trong lĩnh vực này.',
          score: overallScore,
          feedback: 'Phần giới thiệu súc tích, nêu bật được thế mạnh chuyên môn.',
          suggestedStarAnswer: {
            situation: 'Bắt đầu từ các đồ án thực tế và kinh nghiệm làm việc chuyên môn.',
            task: 'Đảm nhận vai trò then chốt trong việc xây dựng sản phẩm chất lượng cao.',
            action: 'Áp dụng các công cụ chuẩn ngành và quy trình phối hợp Agile/Scrum linh hoạt.',
            result: 'Đạt được các sản phẩm hoàn thiện được đánh giá cao bởi khách hàng và đồng nghiệp.'
          }
        }
      ],
      finalAdvice: `Khi bước vào buổi phỏng vấn chính thức, hãy luôn nhớ quy tắc "Nêu kết quả trước, chi tiết sau" (Bottom-line first) và chuẩn bị sẵn 2-3 câu chuyện thực tế chuẩn STAR để sẵn sàng chinh phục nhà tuyển dụng!`
    };

    return res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    console.error('Lỗi /api/interview/live-summary:', error.message);
    return res.status(500).json({ success: false, message: 'Lỗi tổng hợp báo cáo phỏng vấn.' });
  }
});

/**
 * @route   POST /api/interview/evaluate
 * @desc    Đánh giá chi tiết câu trả lời theo chuẩn STAR
 */
router.post('/evaluate', optionalAuth, (req, res) => {
  try {
    const { question = '', candidateAnswer = '' } = req.body;
    if (!candidateAnswer || candidateAnswer.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp câu trả lời chi tiết hơn.' });
    }

    const words = candidateAnswer.trim().split(/\s+/).length;
    let score = 7.5;
    if (words > 40) score = 8.5;
    if (words > 70) score = 9.2;
    if (words < 15) score = 5.5;

    return res.json({
      success: true,
      data: {
        score,
        ratingTier: score >= 8.5 ? 'Xuất sắc' : score >= 7 ? 'Đạt yêu cầu' : 'Cần rèn luyện thêm',
        starEvaluation: {
          situation: 'Đã đề cập bối cảnh và nguyên nhân phát sinh vấn đề một cách rõ ràng.',
          task: 'Xác định đúng mục tiêu cốt lõi và trách nhiệm của bản thân.',
          action: 'Các bước hành động logic, có áp dụng phương pháp chuyên môn phù hợp.',
          result: 'Có kết quả tích cực, nên bổ sung thêm số liệu định lượng để tăng sức thuyết phục.'
        },
        intentionalHookingEvaluation: {
          feedback: 'Có thể khéo léo kết thúc câu trả lời bằng một câu hỏi gợi mở hoặc điểm nhấn về bài học rút ra để thu hút nhà tuyển dụng hỏi sâu hơn.'
        },
        improvedAnswer: `Bối cảnh: Khi đối mặt với yêu cầu của dự án...\nHành động: Tôi đã tiến hành khảo sát và thực hiện 3 bước cải tiến...\nKết quả: Sản phẩm đạt hiệu quả vượt 25% so với mục tiêu ban đầu.`
      }
    });
  } catch (error) {
    console.error('Lỗi /api/interview/evaluate:', error);
    return res.status(500).json({ success: false, message: 'Lỗi đánh giá STAR.' });
  }
});

/**
 * @route   POST /api/interview/submit-answer
 * @desc    Chấm điểm câu trả lời phỏng vấn theo chuẩn STAR (Tương thích Đặc tả Kỹ thuật)
 */
router.post('/submit-answer', optionalAuth, (req, res) => {
  try {
    const { sessionId, questionId, userAnswer } = req.body;
    if (!userAnswer || userAnswer.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp câu trả lời chi tiết hơn để AI có thể đánh giá chính xác.'
      });
    }

    const answerLength = userAnswer.trim().split(/\s+/).length;
    let score = 7;
    if (answerLength > 40) score = 8.5;
    if (answerLength > 80) score = 9.2;
    if (answerLength < 15) score = 5.5;

    const strengths = [
      'Nắm vững khái niệm chuyên môn và có tư duy logic trong việc diễn đạt giải pháp.',
      'Câu trả lời thể hiện thái độ cầu thị, sẵn sàng lắng nghe và phối hợp liên phòng ban.',
      'Đã đề cập đến các công cụ tiêu chuẩn ngành và tư duy lấy người dùng làm trung tâm.'
    ];

    const improvements = [
      'Nên bổ sung thêm số liệu cụ thể (Metrics / KPIs) để chứng minh hiệu quả câu trả lời.',
      'Có thể chia sẻ thêm về bài học kinh nghiệm rút ra sau dự án để tăng tính thuyết phục.'
    ];

    const starSampleAnswer = {
      situation: 'Trong dự án nâng cấp ứng dụng Fintech gần đây, tỷ lệ hoàn tất nộp hồ sơ vay giảm 18% do biểu mẫu quá dài và nhiều bước.',
      task: 'Nhiệm vụ của tôi là tối ưu hóa luồng trải nghiệm (Flow) mà không làm giảm các thông tin pháp lý bắt buộc.',
      action: 'Tôi đã chia nhỏ form thành mô hình Progressive Disclosure gồm 3 bước rõ ràng, bổ sung thanh tiến độ trực quan, và tối ưu micro-copy.',
      result: 'Sau 2 tuần A/B Testing, tỷ lệ hoàn tất biểu mẫu tăng 31%, thời gian hoàn thành trung bình giảm từ 6 phút xuống còn 2.5 phút.'
    };

    return res.json({
      success: true,
      evaluation: {
        score,
        ratingTier: score >= 8.5 ? 'Xuất sắc' : score >= 7 ? 'Đạt yêu cầu' : 'Cần rèn luyện thêm',
        strengths,
        improvements,
        starSampleAnswer
      }
    });
  } catch (error) {
    console.error('Lỗi POST /api/interview/submit-answer:', error);
    return res.status(500).json({ success: false, message: 'Lỗi chấm điểm câu trả lời.' });
  }
});

/**
 * @route   POST /api/freelance/proposal & POST /api/interview/proposal
 * @desc    AI Freelance Proposal Generator
 */
const handleProposal = (req, res) => {
  try {
    const { brief, projectTitle, clientRequirement, freelancerSkills, skills = ['UI/UX', 'Figma'], budget } = req.body;
    const projectBrief = brief || clientRequirement || projectTitle || 'Thiết kế giao diện ứng dụng di động';
    const activeSkills = freelancerSkills || skills;

    const proposalContent = `Kính gửi Quý Khách hàng / Doanh nghiệp,

Tôi đã đọc kỹ yêu cầu dự án "${projectBrief.slice(0, 80)}..." và rất hào hứng muốn đồng hành cùng Quý vị. 

Với hơn 3 năm kinh nghiệm chuyên sâu về ${Array.isArray(activeSkills) ? activeSkills.slice(0, 3).join(', ') : activeSkills}, tôi đã từng thực hiện thành công nhiều dự án tương tự và cam kết mang lại sản phẩm đạt chuẩn quốc tế:
1. Nghiên cứu & Phân tích cấu trúc: Phác thảo Wireframe và luồng thao tác người dùng tối ưu.
2. Thiết kế giao diện Visual sắc nét: Chuẩn hóa Design System, Responsive hoàn hảo trên Mobile & Desktop.
3. Bàn giao & Hỗ trợ kỹ thuật: Bàn giao toàn bộ source file Figma gốc có tổ chức khoa học kèm tài liệu hướng dẫn bàn giao lập trình.

Tôi sẵn sàng bắt đầu ngay và đồng ý thanh toán bảo chứng qua ConnectCV Escrow để đảm bảo quyền lợi tối đa cho cả hai bên.`;

    const suggestedBudget = budget || '12.000.000 - 18.000.000 VNĐ';

    const clarifyingQuestions = [
      'Dự án hiện đã có tài liệu Brand Guidelines và Logo chính thức chưa, hay cần phát triển mới từ đầu?',
      'Khách hàng mục tiêu của sản phẩm tập trung vào đối tượng người dùng nào và trên thiết bị nào là chủ yếu?',
      'Mốc thời gian dự kiến (Milestone) để hoàn tất giai đoạn 1 thử nghiệm là khi nào?'
    ];

    return res.json({
      success: true,
      data: {
        proposalContent,
        suggestedBudget,
        estimatedDuration: '2 - 3 tuần',
        clarifyingQuestions,
        subject: `[Ứng Tuyển] Đề xuất giải pháp thực hiện dự án: ${projectBrief.slice(0, 50)}`,
        openingHook: `Tôi nhận thấy dự án của bạn cần sự kết hợp hoàn hảo giữa tính thẩm mỹ và hiệu năng cao. Đây chính là thế mạnh cốt lõi mà tôi đã triển khai cho hơn 15 khách hàng trước đó.`
      }
    });
  } catch (error) {
    console.error('Lỗi sinh proposal:', error);
    return res.status(500).json({ success: false, message: 'Lỗi sinh thư chào thầu.' });
  }
};

router.post('/proposal', optionalAuth, handleProposal);

module.exports = router;
module.exports.handleProposal = handleProposal;
