import React, { useState } from 'react';
import { Brain, Clock, ChevronRight, CheckCircle, AlertTriangle, ArrowLeft, Download, RefreshCcw, Briefcase } from 'lucide-react';

export default function InterviewPage() {
  const [step, setStep] = useState('setup'); // 'setup', 'interview', 'results'
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answer, setAnswer] = useState('');

  const mockQuestions = [
    "Tell me about a challenging project you worked on and how you overcame the obstacles?",
    "How do you prioritize your tasks when working on multiple projects with tight deadlines?",
    "Describe a situation where you had a disagreement with a team member. How did you handle it?",
    "Where do you see your career going in the next 5 years?",
    "What is your approach to learning a new technology or tool?"
  ];

  const handleStart = (e) => {
    e.preventDefault();
    setStep('interview');
    setCurrentQuestionIdx(0);
    setAnswer('');
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < mockQuestions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setAnswer('');
    } else {
      setStep('results');
    }
  };

  const renderSetup = () => (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mt-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-dark">Configure Your Mock Interview</h2>
        <p className="text-gray-500 mt-2">Our AI will generate tailored questions based on the job role.</p>
      </div>

      <form onSubmit={handleStart} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
          <input 
            type="text" 
            placeholder="e.g. Senior Frontend Developer"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
          <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white">
            <option>Entry Level</option>
            <option>Mid Level</option>
            <option>Senior</option>
            <option>Lead / Manager</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Description (Optional)</label>
          <textarea 
            rows="4" 
            placeholder="Paste the job description here for more accurate questions..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          ></textarea>
        </div>

        <button 
          type="submit"
          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4"
        >
          Bắt đầu phỏng vấn
          <ChevronRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );

  const renderInterview = () => (
    <div className="max-w-3xl mx-auto mt-8">
      <button 
        onClick={() => setStep('setup')}
        className="flex items-center text-gray-500 hover:text-dark mb-6 transition-colors text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Cancel Interview
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-bold">
            Question {currentQuestionIdx + 1} of {mockQuestions.length}
          </span>
          <div className="flex items-center gap-2 text-red-500 font-bold bg-red-50 px-3 py-1 rounded-full border border-red-100">
            <Clock className="w-4 h-4" />
            02:30
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <h3 className="text-xl sm:text-2xl font-bold text-dark mb-6 leading-relaxed">
            "{mockQuestions[currentQuestionIdx]}"
          </h3>

          <textarea 
            rows="8"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-gray-700 resize-none"
          ></textarea>

          <div className="flex justify-between items-center mt-6">
            <button 
              onClick={handleNextQuestion}
              className="text-gray-500 hover:text-gray-700 font-medium px-4 py-2"
            >
              Skip
            </button>
            <button 
              onClick={handleNextQuestion}
              className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
            >
              {currentQuestionIdx === mockQuestions.length - 1 ? 'Finish & Analyze' : 'Submit Answer'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="max-w-4xl mx-auto mt-8 space-y-6">
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <h2 className="text-2xl font-bold text-dark mb-6">Interview Evaluation Results</h2>
        
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-32 h-32 rounded-full border-8 border-primary-500 flex items-center justify-center mb-4">
            <span className="text-4xl font-bold text-dark">8.5<span className="text-xl text-gray-400">/10</span></span>
          </div>
          <h3 className="text-xl font-bold text-primary-600">Great Job!</h3>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">You have strong communication skills and provided solid examples. See details below to improve further.</p>
        </div>

        <div className="flex justify-center gap-4">
          <button 
            onClick={() => setStep('setup')}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </button>
          <button className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-dark mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Strengths
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 bg-green-50 p-3 rounded-lg border border-green-100">
              <span className="text-green-700 text-sm font-medium">Clear communication and structure in answering behavioral questions.</span>
            </li>
            <li className="flex items-start gap-2 bg-green-50 p-3 rounded-lg border border-green-100">
              <span className="text-green-700 text-sm font-medium">Strong emphasis on teamwork and conflict resolution.</span>
            </li>
            <li className="flex items-start gap-2 bg-green-50 p-3 rounded-lg border border-green-100">
              <span className="text-green-700 text-sm font-medium">Good technical vocabulary used correctly in context.</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-dark mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Areas for Improvement
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 bg-orange-50 p-3 rounded-lg border border-orange-100">
              <span className="text-orange-700 text-sm font-medium">Could elaborate more on the specific metrics or results achieved in past projects.</span>
            </li>
            <li className="flex items-start gap-2 bg-orange-50 p-3 rounded-lg border border-orange-100">
              <span className="text-orange-700 text-sm font-medium">Try to use the STAR method (Situation, Task, Action, Result) more consistently.</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-dark mb-4">Question Breakdown</h3>
        <div className="space-y-4">
          {mockQuestions.map((q, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-start gap-4 mb-2">
                <h4 className="font-semibold text-dark text-sm sm:text-base">Q{i+1}: {q}</h4>
                <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded">
                  {(Math.random() * (9.5 - 7.0) + 7.0).toFixed(1)}/10
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-center text-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark flex items-center justify-center gap-3">
            <Brain className="w-8 h-8 text-primary-500" />
            AI Mock Interview
          </h1>
          <p className="text-gray-500 mt-2">Practice your interview skills with our AI interviewer</p>
        </div>
      </div>

      {step === 'setup' && renderSetup()}
      {step === 'interview' && renderInterview()}
      {step === 'results' && renderResults()}

    </div>
  );
}
