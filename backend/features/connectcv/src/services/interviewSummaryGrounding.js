'use strict';
function summaryVersionError(body){
 if (body && body.reportVersion !== undefined && body.reportVersion !== 2) {
  return {success:false,code:'INTERVIEW_REPORT_CLIENT_OUTDATED',message:'Bản luyện phỏng vấn đã được cập nhật. Hãy lưu hoặc sao chép hội thoại hiện tại trước khi tải lại trang để nhận báo cáo mới.'};
 }
 return null;
}
function answeredPairs(history) {
 const bank=require('./interviewQuestionBank'), records=require('../../assets/interview-bank/seed.json').records;
 const pairs=[];let question='',questionId='';
 for(const turn of history.slice(-20)){
  const text=String(turn.message||turn.content||'').trim();if(!text)continue;
  if(turn.role==='interviewer'){question=text;questionId=turn.questionId||'';}
  else if(turn.role==='candidate'&&question){const byId=questionId?bank.getQuestion(questionId):null;
   const source=byId&&question.endsWith(byId.question)?byId:records.find(row=>question===row.question||question.endsWith(' '+row.question));
   const intent=require('./interviewTurnPolicy').detectTurnIntent(text);
   pairs.push({answerId:'answer-'+(pairs.length+1),question:source?.question||question,candidateAnswer:text,
    ...(source?{questionId:source.id,answerType:source.answerType}:{}),...(intent.type!=='answer'?{skipped:true}:{})});question='';questionId='';}
  else if(turn.role==='candidate'&&pairs.length)pairs[pairs.length-1].candidateAnswer+='\n'+text;
 }
 return pairs;
}
function groundSummary(result,pairs){
 if(!pairs.length)throw Error('No answered interview turns');
 const {groundEvaluation}=require('./interviewEvaluationService');
 const rows=Array.isArray(result.qaBreakdown)?result.qaBreakdown:[];
 const qaBreakdown=pairs.map(pair=>{
  if(pair.skipped)return {...pair,score:null,status:'skipped',suggestedStarAnswer:null,strengths:[],verifiedComponents:[],rejectedComponents:[],followUpQuestions:[],critique:'Đã bỏ qua hoặc chưa có câu trả lời. Không chấm điểm và không yêu cầu bổ sung STAR cho lượt này.'};
  // Unknown/free-form questions have no trusted rubric. Do not classify them
  // from client metadata or ask a STAR evaluator to invent their question type.
  if(!pair.answerType)return {...pair,score:null,status:'unclassified',suggestedStarAnswer:null,strengths:[],verifiedComponents:[],rejectedComponents:[],followUpQuestions:[],
   critique:'Chưa xác định được loại câu hỏi từ ngân hàng. Giữ nguyên câu trả lời, chưa chấm điểm hoặc áp dụng STAR; cần đối chiếu đúng loại câu hỏi trước khi đánh giá.'};
  if(pair.answerType&&pair.answerType!=='behavioral'){
   const source=require('./interviewQuestionBank').getQuestion(pair.questionId);
   return {...pair,score:null,status:'reference_only',suggestedStarAnswer:null,strengths:[],verifiedComponents:[],rejectedComponents:[],followUpQuestions:[],
    keyPoints:source.keyPoints,redFlags:source.redFlags,referenceAnswer:source.answerSample,
    critique:'Câu hỏi kiến thức hoặc tình huống: đối chiếu trực tiếp với các ý cần có; không ép khung STAR. Chưa xác minh độ đúng chuyên môn chỉ từ bản tổng kết.',
    referenceNotice:'Đáp án tham khảo đang biên soạn; điều chỉnh theo trải nghiệm thật, không nhận thành tích giả định là của bạn.'};
  }
  const matches=rows.filter(row=>row.answerId===pair.answerId);
  if(matches.length!==1||typeof matches[0].score!=='number'||!Number.isFinite(matches[0].score)||matches[0].score<0||matches[0].score>10)throw Error('AI evaluation does not match answered turns');
  // Apply the same complete-sentence/negation rule as single-answer evaluation.
  // Facts and scores cannot borrow evidence from another turn. Model prose and
  // unknown fields are omitted; practice guidance is derived from verified gaps.
  const grounded=groundEvaluation(matches[0],pair);
  return {...pair,score:grounded.score,scoreNote:grounded.scoreNote,
   suggestedStarAnswer:grounded.suggestedStarAnswer,
   verifiedComponents:grounded.verifiedComponents,rejectedComponents:grounded.rejectedComponents,
   strengths:grounded.strengths,followUpQuestions:grounded.followUpQuestions,
   practiceTask:grounded.practiceTask,critique:grounded.practiceTask};
 });
 const overallScore=qaBreakdown.every(row=>typeof row.score==='number')?Math.round(qaBreakdown.reduce((sum,row)=>sum+row.score,0)/qaBreakdown.length*10)/10:null;
 return {qaBreakdown,overallScore,
  scoreNote:'Điểm là ước lượng của AI để luyện tập dựa trên trích dẫn đã kiểm tra. Chất lượng rubric vẫn cần đánh giá bởi người thử.',
  strengths:[],
  improvements:qaBreakdown.flatMap((row,i)=>row.followUpQuestions.map(q=>`Câu ${i+1}: ${q}`)),
  finalAdvice:'Chọn một câu cần làm rõ, bổ sung thông tin thực tế rồi luyện lại. Giữ nguyên phủ định và chỉ dùng số liệu có bằng chứng.',
  rating:overallScore===null?'Chưa xác minh':overallScore>=8.5?'Xuất Sắc':overallScore>=7?'Rất Tốt':'Cần Trau Dồi Thêm',
  summary:`Đã ghi nhận ${pairs.length} lượt, trong đó ${pairs.filter(p=>p.skipped).length} lượt bỏ qua/chưa trả lời không được chấm. Chỉ câu hỏi hành vi dùng STAR; câu hỏi kiến thức và tình huống được đối chiếu trực tiếp với đáp án tham khảo. Điểm chưa xác minh được để trống.`};
}
function needsModel(pair){return !pair.skipped&&pair.answerType==='behavioral';}
module.exports={answeredPairs,groundSummary,summaryVersionError,needsModel};
