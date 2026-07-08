/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { 
  Brain, Trophy, Sparkles, Key, Mail, User, HelpCircle, ArrowRight, Star, 
  ArrowLeft, CheckCircle2, ChevronRight, BookOpen, Activity, AlertTriangle, BarChart3,
  Globe, Shield, TrendingUp, Users, Check, X, ChevronDown, Download, 
  ThumbsUp, ThumbsDown, Share2, FileText, Moon, Sun, Facebook, Youtube, MessageSquare
} from 'lucide-react';
import { Level } from '../types';

interface WelcomeScreenProps {
  onLoginSuccess: (name: string, level: Level) => void;
}

interface IRTQuestion {
  id: number;
  topic: string;
  question: string;
  options: string[];
  correctIdx: number;
  difficulty: number; // IRT item difficulty parameter 'b'
  hint: string;
}

// Comprehensive Item Pool across the 4 core Mathematics domains
const IRT_ITEM_BANK: IRTQuestion[] = [
  // --- TOPIC 1: ALGEBRA ---
  {
    id: 11,
    topic: 'Algebra',
    question: 'Giải phương trình bậc hai sau trên tập số thực: x² - 5x + 6 = 0. Tìm tập nghiệm đúng.',
    options: [
      'x ∈ {2, 3}',
      'x ∈ {1, 6}',
      'x ∈ {-2, -3}',
      'Phương trình vô nghiệm thực'
    ],
    correctIdx: 0,
    difficulty: -1.0, // Easy / Foundation
    hint: 'Phân tích đa thức thành nhân tử: (x-2)(x-3) = 0.'
  },
  {
    id: 12,
    topic: 'Algebra',
    question: 'Cho hàm số f(x) thỏa mản hệ thức f(f(x)) = x + 2 với mọi số thực x. Hỏi hàm bậc nhất f(x) có thể là hàm nào sau đây?',
    options: [
      'f(x) = x + 1',
      'f(x) = x + 2',
      'f(x) = -x + 1',
      'Không tồn tại hàm bậc nhất thỏa mãn'
    ],
    correctIdx: 0,
    difficulty: 0.5, // Medium / Advanced
    hint: 'Phép thử thế tuyến tính: Thay f(x) = x + c vào hệ thức: (x + c) + c = x + 2c = x + 2 => c = 1.'
  },
  {
    id: 13,
    topic: 'Algebra',
    question: 'Xác định số nghiệm thực phân biệt (x, y) thỏa mãn phương trình: x² + 2x·sin(xy) + 1 = 0.',
    options: [
      'Vô số nghiệm',
      'Nghiệm duy nhất',
      'Đúng hai nghiệm',
      'Vô nghiệm thực'
    ],
    correctIdx: 0,
    difficulty: 1.8, // Hard / Olympiad
    hint: 'Biến đổi tương đương: (x + sin(xy))² + cos²(xy) = 0. Để phương trình có nghiệm thực, ta phải có cos(xy) = 0 và x = -sin(xy). Có vô số nghiệm y thỏa mãn.'
  },

  // --- TOPIC 2: COMBINATORICS ---
  {
    id: 21,
    topic: 'Combinatorics',
    question: 'Có một nhóm gồm 5 học sinh tài năng. Hỏi cần bao nhiêu cách chọn ra một ban cán sự gồm đúng 2 thành viên?',
    options: [
      '10 cách',
      '20 cách',
      '5 cách',
      '15 cách'
    ],
    correctIdx: 0,
    difficulty: -1.0, // Easy / Foundation
    hint: 'Công thức tổ hợp chập 2 của 5 học sinh: C(5, 2) = 5! / (2! * 3!) = 10.'
  },
  {
    id: 22,
    topic: 'Combinatorics',
    question: 'Có bao nhiêu cách sắp đặt 4 học sinh ngồi quanh một bàn tròn xoay (hai cách xếp được sắp giống nhau nếu có thể trùng khớp qua phép quay)?',
    options: [
      '6 cách',
      '24 cách',
      '12 cách',
      '4 cách'
    ],
    correctIdx: 0,
    difficulty: 0.5, // Medium / Advanced
    hint: 'Sử dụng hoán vị vòng quanh cố định 1 người làm mốc: (n-1)! = (4-1)! = 3! = 6.'
  },
  {
    id: 23,
    topic: 'Combinatorics',
    question: 'Một đồ thị đơn vô hướng có 10 đỉnh. Số cạnh cực đại mà đồ thị này có thể có mà không chứa bất cứ chu trình tam giác (K3) nào là bao nhiêu?',
    options: [
      '25 cạnh',
      '45 cạnh',
      '20 cạnh',
      '30 cạnh'
    ],
    correctIdx: 0,
    difficulty: 1.8, // Hard / Olympiad
    hint: 'Theo Định lí Mantel (Mantel\'s Theorem), đồ thị không có tam giác bậc cực đại hữu hạn cạnh tối đa là [n²/4]. Với n = 10 ta có 10²/4 = 25.'
  },

  // --- TOPIC 3: NUMBER THEORY ---
  {
    id: 31,
    topic: 'Number Theory',
    question: 'Xác định số nguyên dương bé nhất có chứa đúng 3 ước số dương phân biệt trong tập số tự nhiên.',
    options: [
      '4',
      '6',
      '9',
      '8'
    ],
    correctIdx: 0,
    difficulty: -1.0, // Easy / Foundation
    hint: 'Một số tự nhiên có đúng 3 ước dương khi và chỉ khi nó là bình phương của một số nguyên tố. Số nguyên tố nhỏ nhất là 2, bình phương là 4.'
  },
  {
    id: 32,
    topic: 'Number Theory',
    question: 'Hãy tính số dư của phép tính chia đồng dư lũy thừa sau: 2²⁰²⁶ chia cho 3 dư bao nhiêu?',
    options: [
      '1',
      '2',
      '0',
      'Lũy thừa không thể chia'
    ],
    correctIdx: 0,
    difficulty: 0.5, // Medium / Advanced
    hint: 'Sử dụng congruences: 2 ≡ -1 (mod 3) => 2²⁰²⁶ ≡ (-1)²⁰²⁶ ≡ 1 (mod 3).'
  },
  {
    id: 33,
    topic: 'Number Theory',
    question: 'Tìm tất cả các cặp số nguyên dương (x, y) thỏa mãn phương trình Diophantine sau: x² - y! = 2026.',
    options: [
      '0 cặp',
      '1 cặp',
      '2 cặp',
      'Vô số cặp'
    ],
    correctIdx: 0,
    difficulty: 1.8, // Hard / Olympiad
    hint: 'Xét theo modulo 7, ta thấy y! ≡ 0 với mọi y >= 7, dẫn tới x² ≡ 3 (mod 7). Tuy nhiên 3 không phải số chính phương mod 7. Dùng phép thử nhỏ hơn 7 cũng vô nghiệm.'
  },

  // --- TOPIC 4: GEOMETRY ---
  {
    id: 41,
    topic: 'Geometry',
    question: 'Trong hình học phẳng Euclid, tổng số đo của 6 góc trong của một lục giác lồi bằng bao nhiêu độ?',
    options: [
      '720 độ',
      '540 độ',
      '900 độ',
      '1080 độ'
    ],
    correctIdx: 0,
    difficulty: -1.0, // Easy / Foundation
    hint: 'Tổng số đo góc của n-giác lồi bằng: (n-2)*180 độ. Với lục giác (n=6), ta có 4 * 180 = 720 độ.'
  },
  {
    id: 42,
    topic: 'Geometry',
    question: 'Cho tam giác đều ABC nội tiếp trong đường tròn bán kính R. Diện tích của tam giác đều ABC bằng bao nhiêu?',
    options: [
      '3√3 R² / 4',
      '√3 R² / 2',
      '3√3 R² / 2',
      '3 R² / 4'
    ],
    correctIdx: 0,
    difficulty: 0.5, // Medium / Advanced
    hint: 'Cạnh tam giác nội tiếp đều là a = R√3. Diện tích S = a² √3/4 = (R√3)² * √3 / 4 = 3√3 R² / 4.'
  },
  {
    id: 43,
    topic: 'Geometry',
    question: 'Đường thẳng Euler của một tam giác không đều là đường thẳng đi qua các điểm đặc biệt nào dưới đây của tam giác đó?',
    options: [
      'Trực tâm H, Trọng tâm G, Tâm đường tròn ngoại tiếp O',
      'Tâm nội tiếp I, Trọng tâm G, Trực tâm H',
      'Tâm nội tiếp I, Trực tâm H, Tâm đường tròn ngoại tiếp O',
      'Đường thẳng Euler không đi qua trọng tâm'
    ],
    correctIdx: 0,
    difficulty: 1.8, // Hard / Olympiad
    hint: 'Phát biểu Euler định nghĩa: Trực tâm H, Trọng tâm G, và Tâm ngoại tiếp O luôn thẳng hàng theo hệ thức vector HG = 2 GO.'
  }
];

interface LocalUser {
  fullName: string;
  email: string;
  password?: string;
  level: Level;
}

export default function WelcomeScreen({ onLoginSuccess }: WelcomeScreenProps) {
  const [authMode, setAuthMode] = useState<'landing' | 'login' | 'register' | 'placement'>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // --- REAL-TIME STATISTICS STATE & POLLING ---
  const [liveStats, setLiveStats] = useState({
    activeUsers: 1428,
    testsCompleted: 12482,
    activeContestsCount: 382,
    facebookAcquisitions: 5420,
    tiktokAcquisitions: 3892,
    youtubeAcquisitions: 2150,
    improvementRate: 84.5
  });

  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        const res = await fetch('/api/live-stats');
        if (res.ok) {
          const data = await res.json();
          setLiveStats(data);
        }
      } catch (err) {
        console.error('Error fetching live stats from server:', err);
      }
    };
    fetchLiveStats();
    const interval = setInterval(fetchLiveStats, 5000);
    return () => clearInterval(interval);
  }, []);

  // --- LANDING PAGE INTERACTIVE STATES ---
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [activeArchTab, setActiveArchTab] = useState<'engine' | 'ai' | 'compete' | 'analytics'>('engine');
  const [isArchExpanded, setIsArchExpanded] = useState<boolean>(false);
  const [communityDarkMode, setCommunityDarkMode] = useState<boolean>(true);
  const [mockVotes, setMockVotes] = useState<Record<string, number>>({
    'disc-1': 42,
    'disc-2': 18
  });
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  // Local user persistence keys
  const USER_DB_KEY = 'calculix_registered_users';

  // Active check to wipe old pre-seeded trial profiles and initialize clean database
  useEffect(() => {
    const existingRaw = localStorage.getItem(USER_DB_KEY);
    if (!existingRaw || existingRaw.includes('student@calculix.vn') || existingRaw.includes('Lê Minh Triết')) {
      localStorage.setItem(USER_DB_KEY, JSON.stringify([]));
    }
  }, []);

  // Computer Adaptive Test (CAT) States based on Item Response Theory (IRT)
  const [activeStage, setActiveStage] = useState<number>(0); // 0, 1, 2, 3 correspond to the 4 topics
  const [currentQuestion, setCurrentQuestion] = useState<IRTQuestion>(() => {
    // Stage 0 is "Algebra", default starts at difficulty b = 0.5 (Advanced candidate)
    return IRT_ITEM_BANK.find(q => q.topic === 'Algebra' && q.difficulty === 0.5) || IRT_ITEM_BANK[1];
  });
  
  const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(null);
  const [theta, setTheta] = useState<number>(0.0); // Estimated Latent Trait level (ranges from -3 to +3)
  const [sem, setSem] = useState<number>(2.0); // Standard Error of Measurement (estimated uncertainty of the latent trait)
  const [irtLog, setIrtLog] = useState<string[]>(['[IRT System] Khởi tạo tham số trạng thái: Theta theta = 0.00 (Yếu tố năng lực trung bình).']);
  const [testCompleted, setTestCompleted] = useState<boolean>(false);
  const [calculatedLevel, setCalculatedLevel] = useState<Level>('Foundation');
  const [score, setScore] = useState<number>(0);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Vui lòng cung cấp mật thư đăng nhập đầy đủ.');
      return;
    }

    if (!isSupabaseConfigured() || !supabase) {
      setErrorMessage('Supabase chưa được cấu hình. Vui lòng thêm VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY vào file .env.');
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (error || !data.user) {
      setErrorMessage(error?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      return;
    }

    const displayName = data.user.user_metadata?.full_name || data.user.email || 'Học viên Calculix';
    onLoginSuccess(displayName, 'Foundation');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password.trim() || !fullName.trim()) {
      setErrorMessage('Vui lòng hoàn thành mọi vùng trường dữ liệu bắt buộc.');
      return;
    }

    if (password.length < 4) {
      setErrorMessage('Mật khẩu tự chọn tối thiểu phải từ 4 ký tự.');
      return;
    }

    if (!isSupabaseConfigured() || !supabase) {
      setErrorMessage('Supabase chưa được cấu hình. Vui lòng thêm VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY vào file .env.');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    if (error) {
      setErrorMessage(error.message || 'Đăng ký thất bại.');
      return;
    }

    if (data.user) {
      fetch('/api/live-stats/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'user-joined' }),
      }).catch(err => console.error('Error reporting user-joined event:', err));
    }

    setSuccessMessage('Tài khoản đã được tạo. Hãy xác nhận email nếu Supabase yêu cầu và tiếp tục với bài đánh giá xếp lớp.');

    setTimeout(() => {
      setAuthMode('placement');
      setActiveStage(0);
      setSelectedAnswerIdx(null);
      setTheta(0.0);
      setSem(2.0);
      setScore(0);
      setTestCompleted(false);
      setIrtLog([
        `[IRT System] Đăng ký thành công học viên: ${fullName.trim()}`,
        `[IRT System] Khởi tạo tham số trạng thái: Theta theta = 0.00 (Triển khai mô hình Rasch 1PL).`
      ]);
      const q = IRT_ITEM_BANK.find(item => item.topic === 'Algebra' && item.difficulty === 0.5) || IRT_ITEM_BANK[1];
      setCurrentQuestion(q);
      setSuccessMessage('');
    }, 1500);
  };

  // Implement the 1PL Item Response Theory (IRT) Math calculation for latent ability theta
  const runIrtThetaEvaluation = (isCorrect: boolean) => {
    const b = currentQuestion.difficulty;
    const oldTheta = theta;
    const scoreVal = isCorrect ? 1.0 : 0.0;

    // Calculate probability of correct answer based on current theta under 1-Parameter Logistic (Rasch) Model:
    // P(theta) = 1 / (1 + e^-(theta - b))
    const exponent = -(oldTheta - b);
    const probability = 1.0 / (1.0 + Math.exp(exponent));

    // Update latent capability using Stochastic Approximation rule (Fisher Scoring optimization step)
    // theta_new = theta_old + StepSize * (UserScore - P(theta_old))
    const stepSize = 1.6;
    const rawDelta = stepSize * (scoreVal - probability);
    let newTheta = oldTheta + rawDelta;

    // Constrain theta to practical boundaries [-3.0, +3.0]
    newTheta = Math.max(-3.0, Math.min(3.0, newTheta));

    // Update Fisher Information for standard error update: I = P * (1 - P)
    const itemInfo = probability * (1.0 - probability);
    // Prior information sum starts at 0.15 to avoid zero-division
    const currentWeightSum = (1.0 / (sem * sem)) + itemInfo;
    const newSem = Math.max(0.4, Math.min(2.0, 1.0 / Math.sqrt(currentWeightSum)));

    const nextLogs = [
      ...irtLog,
      `[Môn ${currentQuestion.topic}] Đáp án: ${isCorrect ? 'ĐÚNG' : 'SAI'} (b = ${b.toFixed(1)}).`,
      `[IRT Update] P(đúng) = ${(probability * 100).toFixed(1)}%. Thay đổi theta: ${oldTheta.toFixed(2)} → ${newTheta.toFixed(2)} (Bậc lệch: ${rawDelta > 0 ? '+' : ''}${rawDelta.toFixed(2)}).`,
      `[IRT Độ sai số] SEM chi tiết: ${sem.toFixed(2)} → ${newSem.toFixed(2)}.`
    ];

    setTheta(newTheta);
    setSem(newSem);
    setIrtLog(nextLogs);
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    return newTheta;
  };

  const handleNextIrtQuestion = () => {
    if (selectedAnswerIdx === null) {
      setErrorMessage('Ban kiểm vụ yêu cầu chọn 1 phương án đáp án để ghi nhận điểm số.');
      return;
    }
    setErrorMessage('');

    const isCorrect = (selectedAnswerIdx === currentQuestion.correctIdx);
    const nextEstimatedTheta = runIrtThetaEvaluation(isCorrect);

    const nextStage = activeStage + 1;
    const topics = ['Algebra', 'Combinatorics', 'Number Theory', 'Geometry'];

    if (nextStage < 4) {
      // Find the next stage domain topic
      const nextDomainTopic = topics[nextStage];
      
      // Adaptively select the question from the next domain whose difficulty parameter 'b' is nearest to the newEstimatedTheta
      const domainQuestions = IRT_ITEM_BANK.filter(q => q.topic === nextDomainTopic);
      let bestMatchInput = domainQuestions[0];
      let smallestDistance = Math.abs(bestMatchInput.difficulty - nextEstimatedTheta);

      for (let i = 1; i < domainQuestions.length; i++) {
        const d = Math.abs(domainQuestions[i].difficulty - nextEstimatedTheta);
        if (d < smallestDistance) {
          smallestDistance = d;
          bestMatchInput = domainQuestions[i];
        }
      }

      setIrtLog(prev => [
        ...prev,
        `[Học thích ứng] Chọn câu ${nextStage + 1} (${nextDomainTopic}) có mức khó b = ${bestMatchInput.difficulty.toFixed(1)} tối ưu cho Theta = ${nextEstimatedTheta.toFixed(2)}.`
      ]);

      setActiveStage(nextStage);
      setCurrentQuestion(bestMatchInput);
      setSelectedAnswerIdx(null);
    } else {
      // Finalize classification level mapping
      // Standard mathematical boundaries for classification
      let calculated: Level = 'Foundation';
      if (nextEstimatedTheta >= 1.2) {
        calculated = 'Olympiad';
      } else if (nextEstimatedTheta >= -0.5) {
        calculated = 'Advanced';
      }

      setCalculatedLevel(calculated);
      setTestCompleted(true);

      // Save level back to database for persistent account tracking!
      const usersRaw = localStorage.getItem(USER_DB_KEY);
      const users: LocalUser[] = usersRaw ? JSON.parse(usersRaw) : [];
      const normEmail = email.trim().toLowerCase();

      const updated = users.map(u => {
        if (u.email.toLowerCase() === normEmail) {
          return { ...u, level: calculated };
        }
        return u;
      });
      localStorage.setItem(USER_DB_KEY, JSON.stringify(updated));
    }
  };

  const handleFinishPlacement = () => {
    fetch('/api/live-stats/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'test-completed' }),
    }).catch(err => console.error('Error reporting test-completed event:', err));
    onLoginSuccess(fullName || 'Học viên Calculix', calculatedLevel);
  };

  // --- PDF REPORT EXPORTER FUNCTION ---
  const handleExportImpactReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Calculix Hub - Báo cáo Tác động Giáo dục & Nghiên cứu</title>
          <style>
            body { 
              font-family: 'Montserrat', Arial, sans-serif; 
              color: #0f172a; 
              padding: 45px; 
              line-height: 1.6; 
              background: #ffffff;
            }
            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: center; 
              border-bottom: 3px solid #1e3a8a; 
              padding-bottom: 25px; 
              margin-bottom: 35px; 
            }
            .logo { 
              font-size: 26px; 
              font-weight: 900; 
              color: #1e1b4b; 
              text-transform: uppercase; 
              letter-spacing: 1.5px; 
            }
            .subtitle { 
              font-size: 11px; 
              color: #4b5563; 
              text-transform: uppercase; 
              font-weight: 700; 
              margin-top: 5px; 
            }
            .date { 
              font-size: 13px; 
              color: #4b5563; 
              font-family: monospace; 
              background: #f3f4f6;
              padding: 5px 10px;
              border-radius: 6px;
            }
            .section { 
              margin-bottom: 40px; 
              page-break-inside: avoid; 
            }
            h2 { 
              font-size: 18px; 
              color: #1e3a8a; 
              border-left: 5px solid #3b82f6; 
              padding-left: 12px; 
              margin-bottom: 20px; 
              text-transform: uppercase; 
              letter-spacing: 0.5px; 
            }
            p { 
              font-size: 14px; 
              color: #334155; 
              text-align: justify;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px; 
              font-size: 13px; 
            }
            th, td { 
              border: 1px solid #cbd5e1; 
              padding: 12px; 
              text-align: left; 
            }
            th { 
              background-color: #f8fafc; 
              font-weight: bold; 
              color: #0f172a; 
            }
            .metric-grid { 
              display: grid; 
              grid-template-columns: repeat(3, 1fr); 
              gap: 20px; 
              margin-top: 25px; 
            }
            .metric-card { 
              border: 1px solid #e2e8f0; 
              background: #f8fafc;
              border-radius: 12px; 
              padding: 20px; 
              text-align: center; 
              box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            }
            .metric-val { 
              font-size: 26px; 
              font-weight: 800; 
              color: #2563eb; 
              font-family: monospace; 
              margin: 8px 0; 
            }
            .metric-label { 
              font-size: 10px; 
              color: #64748b; 
              text-transform: uppercase; 
              font-weight: bold; 
            }
            .footer { 
              margin-top: 60px; 
              text-align: center; 
              border-top: 1px solid #e2e8f0; 
              padding-top: 25px; 
              font-size: 11px; 
              color: #64748b; 
            }
            @media print {
              body { padding: 25px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">Calculix Hub</div>
              <div class="subtitle">Math OS & AI Personalization Ecosystem</div>
            </div>
            <div class="date">Thời điểm kết xuất: ${new Date().toLocaleString('vi-VN')}</div>
          </div>

          <div class="section">
            <h2>1. Tổng quan & Định vị chiến lược</h2>
            <p>Calculix Hub là hệ sinh thái giáo dục toán học tiên phong tích hợp công nghệ AI cá nhân hóa sâu sắc (EduReach Core) và mô hình trắc nghiệm thích ứng dựa trên Lý thuyết phản hồi câu hỏi (Item Response Theory - IRT). Hệ thống loại bỏ hoàn toàn cơ chế phân phối câu hỏi tĩnh tuyến tính, thay thế bằng đồ thị tri thức linh hoạt bám sát Vùng phát triển gần nhất (ZPD) của từng học sinh.</p>
          </div>

          <div class="section">
            <h2>2. Chỉ số Hoạt động Thực tế (Real-time Metrics)</h2>
            <div class="metric-grid">
              <div class="metric-card">
                <div class="metric-label">Học viên trực tuyến</div>
                <div class="metric-val">${liveStats.activeUsers}</div>
                <div class="metric-label">Đang kết nối thời gian thực</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Bài test IRT đã thực hiện</div>
                <div class="metric-val">${liveStats.testsCompleted}</div>
                <div class="metric-label">Tổng tích lũy thực tế</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Tỷ lệ cải thiện điểm số</div>
                <div class="metric-val">${liveStats.improvementRate}%</div>
                <div class="metric-label">Đánh giá sau 3 tháng</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>3. Kênh thu hút người dùng (Acquisition Channels)</h2>
            <p>Calculix định vị các mạng xã hội bên ngoài chỉ đóng vai trò là các kênh thu hút và lan tỏa nội dung truyền cảm hứng học thuật (Acquisition channels), hướng toàn bộ lượng người dùng về phễu trung tâm duy nhất là Calculix Hub để thực hiện các hoạt động học tập thực tế:</p>
            <table>
              <thead>
                <tr>
                  <th>Kênh truyền thông</th>
                  <th>Phương pháp tiếp cận học sinh</th>
                  <th>Lượt User thu hút thực tế</th>
                  <th>Tỷ trọng đóng góp</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Facebook (Calculix Hub Page/Group)</strong></td>
                  <td>Đăng tải phân tích toán học, chuyên khảo, tài liệu ôn thi học thuật sâu.</td>
                  <td>${liveStats.facebookAcquisitions}</td>
                  <td>${((liveStats.facebookAcquisitions / (liveStats.facebookAcquisitions + liveStats.tiktokAcquisitions + liveStats.youtubeAcquisitions)) * 100).toFixed(1)}%</td>
                </tr>
                <tr>
                  <td><strong>TikTok (Calculix Short Clips)</strong></td>
                  <td>Truyền cảm hứng toán học, mẹo tư duy nhanh, kích thích sự tò mò của học sinh.</td>
                  <td>${liveStats.tiktokAcquisitions}</td>
                  <td>${((liveStats.tiktokAcquisitions / (liveStats.facebookAcquisitions + liveStats.tiktokAcquisitions + liveStats.youtubeAcquisitions)) * 100).toFixed(1)}%</td>
                </tr>
                <tr>
                  <td><strong>YouTube (Calculix Lectures)</strong></td>
                  <td>Các bài giảng chuyên đề dài, chữa bài thi Olympic chuyên sâu.</td>
                  <td>${liveStats.youtubeAcquisitions}</td>
                  <td>${((liveStats.youtubeAcquisitions / (liveStats.facebookAcquisitions + liveStats.tiktokAcquisitions + liveStats.youtubeAcquisitions)) * 100).toFixed(1)}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section" style="page-break-before: always;">
            <h2>4. Cấu trúc 4 lớp cốt lõi & Phương pháp luận</h2>
            <p>Hệ thống bao gồm 4 cấu trúc thành phần thiết lập nên khung năng lực học tập:</p>
            <ul>
              <li><strong>Learning Engine:</strong> Chia bậc năng lực rõ rệt (Foundation, Advanced, Olympiad) để dẫn dắt học sinh thích ứng tùy biến.</li>
              <li><strong>AI Personalization Layer:</strong> Thuật toán EduReach tự động khoanh vùng điểm yếu (ví dụ: Tổ hợp) và tái cấu trúc lộ trình.</li>
              <li><strong>Competition System:</strong> Tổ chức đấu trường xếp hạng trực tiếp hàng tuần theo độ tuổi và phân nhóm ELO.</li>
              <li><strong>Analytics Radar:</strong> Biểu đồ trực quan hóa dữ liệu lỗi sai thường gặp, hỗ trợ đắc lực cho công tác nghiên cứu học thuật của giáo viên.</li>
            </ul>
          </div>

          <div class="footer">
            <p>Báo cáo khoa học chính thức trích xuất trực tiếp từ máy chủ Calculix Hub.</p>
            <p>Ban Khoa học & Công nghệ Giáo dục Calculix - Tech for Social Impact © 2026</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // --- LANDING PAGE RENDERING FUNCTION ---
  const renderLandingPage = () => {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white flex flex-col antialiased relative overflow-hidden font-sans">
        
        {/* Subtle dynamic grid background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Dynamic decorative backdrop glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[-10%] w-[45%] h-[45%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

        {/* 1. STICKY GLASSMORPHIC NAVBAR */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-900 select-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-blue-500 to-indigo-600 p-2.5 rounded-xl text-white font-black w-10 h-10 flex items-center justify-center text-lg shadow-lg">
                C
              </div>
              <div>
                <h1 className="font-extrabold text-sm tracking-widest text-slate-100 uppercase">Calculix Hub</h1>
                <span className="text-[10px] font-bold text-slate-500 block -mt-1 uppercase tracking-wider">Math OS Platform</span>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-7 text-[11px] font-bold uppercase tracking-wider text-slate-450">
              <a href="#mission" className="hover:text-white transition-colors">Sứ mệnh</a>
              <a href="#definition" className="hover:text-white transition-colors">Định vị</a>
              <a href="#architecture" className="hover:text-white transition-colors">Kiến trúc</a>
              <a href="#community" className="hover:text-white transition-colors">Cộng đồng</a>
              <a href="#flow" className="hover:text-white transition-colors">Quy trình</a>
              <a href="#impact" className="hover:text-white transition-colors">Tác động</a>
            </nav>

            <div className="flex items-center gap-3.5">
              <button 
                type="button"
                onClick={() => setAuthMode('login')} 
                className="text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer px-3 py-1.5 rounded-lg hover:bg-slate-900"
              >
                Đăng nhập
              </button>
              <button 
                type="button"
                onClick={() => setAuthMode('register')} 
                className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs px-4.5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-blue-500/20 hover:shadow-lg active:scale-95 cursor-pointer"
              >
                Làm Test Đầu Vào
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 relative z-10">
          
          {/* 2. HERO SECTION */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/25 px-3 py-1.5 rounded-full text-[10px] font-black uppercase text-blue-400 tracking-wider">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Hệ điều hành chuyên toán tích hợp AI
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.15] text-white">
                Học Toán Thông Minh – <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Phát Triển Tư Duy Toán Học Toàn Diện
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-400 font-serif leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Nền tảng EdTech tích hợp với AI, thi đấu, phân tích dữ liệu real-time, giúp học sinh học Toán hiệu quả và cá nhân hóa.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-3">
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs px-7 py-4.5 rounded-2xl shadow-xl hover:shadow-blue-500/10 hover:shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer group active:scale-98"
                >
                  Bắt đầu ngay – Làm bài test đầu vào miễn phí
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href="#impact"
                  className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-slate-350 hover:text-white font-bold text-xs px-6 py-4.5 rounded-2xl transition-all flex items-center justify-center gap-1.5"
                >
                  Xem báo cáo nghiên cứu
                </a>
              </div>

              {/* Ticking Live Statistics HUD */}
              <div className="pt-8 border-t border-slate-900/70 max-w-xl mx-auto lg:mx-0">
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-3 flex items-center justify-center lg:justify-start gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Trạng thái vận hành của hệ thống (Real-time)
                </p>
                <div className="grid grid-cols-3 gap-6 text-center lg:text-left">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Học viên trực tuyến</span>
                    <span className="text-xl font-black text-white font-mono block tracking-tight">
                      {liveStats.activeUsers.toLocaleString()}
                    </span>
                    <span className="text-[8px] text-emerald-400 font-bold block">+3.4/phút</span>
                  </div>
                  <div className="space-y-1 border-x border-slate-900/60 px-4">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Bài Test đã làm</span>
                    <span className="text-xl font-black text-white font-mono block tracking-tight">
                      {liveStats.testsCompleted.toLocaleString()}
                    </span>
                    <span className="text-[8px] text-indigo-400 font-bold block">Tự động thích ứng</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Đang đấu hạng</span>
                    <span className="text-xl font-black text-white font-mono block tracking-tight">
                      {liveStats.activeContestsCount}
                    </span>
                    <span className="text-[8px] text-purple-400 font-bold block">Đấu trường Live</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Interactive SVG Network Visualizer */}
            <div className="lg:col-span-5 relative">
              <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />
              <div className="bg-slate-950/40 border border-slate-900 p-6 sm:p-8 rounded-[32px] backdrop-blur-md shadow-2xl relative">
                
                {/* SVG Graph visualizer */}
                <svg viewBox="0 0 450 400" className="w-full h-auto max-w-[380px] sm:max-w-[450px] mx-auto overflow-visible select-none">
                  {/* Connection lines */}
                  <line x1="225" y1="200" x2="90" y2="90" stroke={hoveredNode === 1 ? '#3b82f6' : '#1e293b'} strokeWidth={hoveredNode === 1 ? '3' : '2'} strokeDasharray={hoveredNode === 1 ? 'none' : '4 4'} className="transition-all duration-300" />
                  <line x1="225" y1="200" x2="360" y2="90" stroke={hoveredNode === 2 ? '#6366f1' : '#1e293b'} strokeWidth={hoveredNode === 2 ? '3' : '2'} strokeDasharray={hoveredNode === 2 ? 'none' : '4 4'} className="transition-all duration-300" />
                  <line x1="225" y1="200" x2="90" y2="310" stroke={hoveredNode === 3 ? '#ec4899' : '#1e293b'} strokeWidth={hoveredNode === 3 ? '3' : '2'} strokeDasharray={hoveredNode === 3 ? 'none' : '4 4'} className="transition-all duration-300" />
                  <line x1="225" y1="200" x2="360" y2="310" stroke={hoveredNode === 4 ? '#10b981' : '#1e293b'} strokeWidth={hoveredNode === 4 ? '3' : '2'} strokeDasharray={hoveredNode === 4 ? 'none' : '4 4'} className="transition-all duration-300" />

                  {/* Animated packets moving along paths */}
                  {hoveredNode === 1 && (
                    <circle r="4.5" fill="#3b82f6">
                      <animateMotion dur="0.9s" repeatCount="indefinite" path="M 225 200 L 90 90" />
                    </circle>
                  )}
                  {hoveredNode === 2 && (
                    <circle r="4.5" fill="#6366f1">
                      <animateMotion dur="0.9s" repeatCount="indefinite" path="M 225 200 L 360 90" />
                    </circle>
                  )}
                  {hoveredNode === 3 && (
                    <circle r="4.5" fill="#ec4899">
                      <animateMotion dur="0.9s" repeatCount="indefinite" path="M 225 200 L 90 310" />
                    </circle>
                  )}
                  {hoveredNode === 4 && (
                    <circle r="4.5" fill="#10b981">
                      <animateMotion dur="0.9s" repeatCount="indefinite" path="M 225 200 L 360 310" />
                    </circle>
                  )}

                  {/* Central Node (AI Core) */}
                  <g className="group cursor-pointer">
                    <circle cx="225" cy="200" r="45" fill="#1e1b4b" stroke="#4f46e5" strokeWidth="2.5" className="transition-all duration-300 group-hover:stroke-blue-400 group-hover:scale-105" />
                    <circle cx="225" cy="200" r="55" fill="none" stroke="#4f46e5" strokeWidth="1" strokeDasharray="5 5" className="animate-spin" style={{ transformOrigin: '225px 200px', animationDuration: '20s' }} />
                    <foreignObject x="207" y="182" width="36" height="36">
                      <div className="w-full h-full flex items-center justify-center text-indigo-400">
                        <Brain className="w-7 h-7" />
                      </div>
                    </foreignObject>
                    <text x="225" y="260" fill="#a5b4fc" fontSize="9" fontWeight="bold" textAnchor="middle" letterSpacing="1">AI EDUREACH CORE</text>
                  </g>

                  {/* Satellite Node 1: Algebra */}
                  <g 
                    onMouseEnter={() => setHoveredNode(1)} 
                    onMouseLeave={() => setHoveredNode(null)} 
                    className="cursor-pointer"
                  >
                    <circle cx="90" cy="90" r="30" fill="#0b1329" stroke={hoveredNode === 1 ? '#3b82f6' : '#1e293b'} strokeWidth="2" className="transition-all duration-300" />
                    <text x="90" y="93" fill="#60a5fa" fontSize="9" fontWeight="bold" textAnchor="middle">ĐẠI SỐ</text>
                    <circle cx="90" cy="90" r="35" fill="none" stroke="#3b82f6" strokeWidth={hoveredNode === 1 ? '1.5' : '0'} className="transition-all duration-300 animate-ping" />
                  </g>

                  {/* Satellite Node 2: Geometry */}
                  <g 
                    onMouseEnter={() => setHoveredNode(2)} 
                    onMouseLeave={() => setHoveredNode(null)} 
                    className="cursor-pointer"
                  >
                    <circle cx="360" cy="90" r="30" fill="#0b1329" stroke={hoveredNode === 2 ? '#6366f1' : '#1e293b'} strokeWidth="2" className="transition-all duration-300" />
                    <text x="360" y="93" fill="#818cf8" fontSize="9" fontWeight="bold" textAnchor="middle">HÌNH HỌC</text>
                    <circle cx="360" cy="90" r="35" fill="none" stroke="#6366f1" strokeWidth={hoveredNode === 2 ? '1.5' : '0'} className="transition-all duration-300 animate-ping" />
                  </g>

                  {/* Satellite Node 3: Combinatorics */}
                  <g 
                    onMouseEnter={() => setHoveredNode(3)} 
                    onMouseLeave={() => setHoveredNode(null)} 
                    className="cursor-pointer"
                  >
                    <circle cx="90" cy="310" r="30" fill="#0b1329" stroke={hoveredNode === 3 ? '#ec4899' : '#1e293b'} strokeWidth="2" className="transition-all duration-300" />
                    <text x="90" y="313" fill="#f472b6" fontSize="9" fontWeight="bold" textAnchor="middle">TỔ HỢP</text>
                    <circle cx="90" cy="310" r="35" fill="none" stroke="#ec4899" strokeWidth={hoveredNode === 3 ? '1.5' : '0'} className="transition-all duration-300 animate-ping" />
                  </g>

                  {/* Satellite Node 4: Number Theory */}
                  <g 
                    onMouseEnter={() => setHoveredNode(4)} 
                    onMouseLeave={() => setHoveredNode(null)} 
                    className="cursor-pointer"
                  >
                    <circle cx="360" cy="310" r="30" fill="#0b1329" stroke={hoveredNode === 4 ? '#10b981' : '#1e293b'} strokeWidth="2" className="transition-all duration-300" />
                    <text x="360" y="313" fill="#34d399" fontSize="9" fontWeight="bold" textAnchor="middle">SỐ HỌC</text>
                    <circle cx="360" cy="310" r="35" fill="none" stroke="#10b981" strokeWidth={hoveredNode === 4 ? '1.5' : '0'} className="transition-all duration-300 animate-ping" />
                  </g>
                </svg>

                {/* Floating Real-time Info Box */}
                <div className="mt-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-4.5 text-xs space-y-1.5 backdrop-blur-md">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    <span>Trình mô phỏng AI EduReach</span>
                    <span className="text-blue-400 font-mono">LIVE FEED</span>
                  </div>
                  <p className="font-mono text-slate-300 leading-normal text-[11px]">
                    {hoveredNode === 1 && "💡 AI: Phát hiện sai số Đại số. Ưu tiên đề xuất bổ khuyết Quadratic Roots (θ = +0.45)."}
                    {hoveredNode === 2 && "💡 AI: Trực quan hóa hình học không gian. Đề xuất lý thuyết Ptolemy mở rộng (b = 1.80)."}
                    {hoveredNode === 3 && "💡 AI: Phát hiện điểm rơi yếu ở Tổ hợp. Khởi động bài toán vách ngăn (AM-GM)."}
                    {hoveredNode === 4 && "💡 AI: Rèn luyện tính đồng dư Số học. Khuyên dùng chu kỳ Fermat nhỏ."}
                    {!hoveredNode && "⚡ Di chuột qua các đỉnh để AI phân tích cấu trúc năng lực thích ứng."}
                  </p>
                </div>

              </div>
            </div>

          </section>

          {/* 3. CORE DEFINITION SECTION (KHÔNG PHẢI / MÀ LÀ) */}
          <section id="definition" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-900">
            
            <div className="text-center space-y-3 pb-12">
              <h2 className="text-xs uppercase font-extrabold text-blue-500 tracking-widest">Định nghĩa cốt lõi</h2>
              <h3 className="text-2xl sm:text-3xl font-black text-white">Chúng tôi định nghĩa lại cách tiếp cận Toán học</h3>
              <p className="text-xs text-slate-400 max-w-lg mx-auto font-serif">
                Calculix Hub là hệ sinh thái học tập hoàn chỉnh, xóa bỏ hoàn toàn lối mòn học tập thụ động truyền thống.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              
              {/* Left Column: KHÔNG PHẢI (Rose theme) */}
              <div className="border border-rose-950/40 bg-gradient-to-b from-rose-950/5 to-transparent p-6 sm:p-8 rounded-3xl space-y-6 transition-all duration-300 hover:border-rose-900/60 hover:shadow-xl hover:shadow-rose-950/5 group">
                <div className="flex items-center gap-3">
                  <div className="bg-rose-500/10 p-2.5 rounded-2xl border border-rose-500/20 text-rose-500">
                    <X className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-black text-rose-500 tracking-wider">Độc lập thụ động</span>
                    <h4 className="text-lg font-extrabold text-slate-200">Không phải là</h4>
                  </div>
                </div>

                <ul className="space-y-4 text-xs font-semibold text-slate-400">
                  <li className="flex gap-3 items-start group-hover:text-slate-350 transition-colors">
                    <span className="text-rose-500 shrink-0 font-bold">✕</span>
                    <div>
                      <strong className="text-slate-300 font-bold block">Một website giải toán thông thường</strong>
                      <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Nơi học sinh chỉ tra cứu đáp án một cách máy móc, không tạo ra phản xạ tư duy thực chất.</span>
                    </div>
                  </li>
                  <li className="flex gap-3 items-start group-hover:text-slate-350 transition-colors">
                    <span className="text-rose-500 shrink-0 font-bold">✕</span>
                    <div>
                      <strong className="text-slate-300 font-bold block">Một fanpage hay group spam tài liệu</strong>
                      <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Nơi chia sẻ hàng ngàn file đề thi hỗn loạn không được chắt lọc hay cá nhân hóa lộ trình.</span>
                    </div>
                  </li>
                  <li className="flex gap-3 items-start group-hover:text-slate-350 transition-colors">
                    <span className="text-rose-500 shrink-0 font-bold">✕</span>
                    <div>
                      <strong className="text-slate-300 font-bold block">Một kho tàng đề thi tĩnh cứng nhắc</strong>
                      <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Nơi mọi học sinh cùng phải làm một bộ đề dù thực lực và tốc độ tiếp thu hoàn toàn khác nhau.</span>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Right Column: MÀ LÀ (Blue/Indigo theme) */}
              <div className="border border-blue-900/40 bg-gradient-to-b from-blue-950/10 to-transparent p-6 sm:p-8 rounded-3xl space-y-6 transition-all duration-300 hover:border-blue-700/60 hover:shadow-xl hover:shadow-blue-950/10 group">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/10 p-2.5 rounded-2xl border border-blue-500/20 text-blue-400">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-black text-blue-400 tracking-wider">Hệ sinh thái liên kết</span>
                    <h4 className="text-lg font-extrabold text-slate-200">Mà là</h4>
                  </div>
                </div>

                <ul className="space-y-4 text-xs font-semibold text-slate-400">
                  <li className="flex gap-3 items-start group-hover:text-slate-350 transition-colors">
                    <span className="text-emerald-400 shrink-0 font-bold">✓</span>
                    <div>
                      <strong className="text-slate-200 font-bold block">Hệ sinh thái học tập thích ứng thông minh</strong>
                      <span className="text-[10px] text-slate-450 font-medium block mt-0.5">Sử dụng mô hình IRT tiên tiến để định lượng và tối ưu hóa năng lực học tập tự động.</span>
                    </div>
                  </li>
                  <li className="flex gap-3 items-start group-hover:text-slate-350 transition-colors">
                    <span className="text-emerald-400 shrink-0 font-bold">✓</span>
                    <div>
                      <strong className="text-slate-200 font-bold block">Đấu trường cạnh tranh thời gian thực</strong>
                      <span className="text-[10px] text-slate-450 font-medium block mt-0.5">Nơi học sinh thử thách trí tuệ trực tiếp với hệ thống bảng xếp hạng phân hạng ELO.</span>
                    </div>
                  </li>
                  <li className="flex gap-3 items-start group-hover:text-slate-350 transition-colors">
                    <span className="text-emerald-400 shrink-0 font-bold">✓</span>
                    <div>
                      <strong className="text-slate-200 font-bold block">Cộng đồng học thuật chất lượng cao</strong>
                      <span className="text-[10px] text-slate-450 font-medium block mt-0.5">Nơi bình luận, chứng minh và thảo luận chuyên sâu cấu trúc đề thi chuyên đề theo chuẩn mực cao.</span>
                    </div>
                  </li>
                </ul>
              </div>

            </div>

          </section>

          {/* 4. MISSION SECTION */}
          <section id="mission" className="bg-slate-900/40 border-y border-slate-900 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="max-w-3xl mx-auto text-center space-y-6">
                <h3 className="text-xs uppercase font-extrabold text-blue-500 tracking-widest">Sứ mệnh cốt lõi</h3>
                <h4 className="text-xl sm:text-2xl md:text-3xl font-black text-white font-serif leading-relaxed italic">
                  "Democratize high-quality mathematical thinking through AI, competition systems, and data-driven learning."
                </h4>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 max-w-5xl mx-auto">
                
                <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-900 text-center space-y-3.5 transition-all duration-300 hover:scale-[1.02] group">
                  <div className="mx-auto bg-blue-500/10 p-3 rounded-2xl border border-blue-500/20 text-blue-400 w-fit group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Globe className="w-6 h-6" />
                  </div>
                  <h5 className="font-extrabold text-slate-100 text-sm">Mở rộng tiếp cận chất lượng cao</h5>
                  <p className="text-[11px] text-slate-450 leading-relaxed font-serif">
                    Đưa giáo trình chuyên toán nâng cao và cơ sở hạ tầng AI hàng đầu đến mọi miền đất nước, không phân biệt ranh giới địa lý.
                  </p>
                </div>

                <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-900 text-center space-y-3.5 transition-all duration-300 hover:scale-[1.02] group">
                  <div className="mx-auto bg-indigo-500/10 p-3 rounded-2xl border border-indigo-500/20 text-indigo-400 w-fit group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h5 className="font-extrabold text-slate-100 text-sm">Cá nhân hóa lộ trình</h5>
                  <p className="text-[11px] text-slate-450 leading-relaxed font-serif">
                    EduReach Core tự động chẩn đoán điểm khuyết và xây dựng lộ trình luyện tập riêng biệt cho từng khối óc học tập.
                  </p>
                </div>

                <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-900 text-center space-y-3.5 transition-all duration-300 hover:scale-[1.02] group">
                  <div className="mx-auto bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 text-emerald-400 w-fit group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <h5 className="font-extrabold text-slate-100 text-sm">Dựa trên dữ liệu thực tế</h5>
                  <p className="text-[11px] text-slate-450 leading-relaxed font-serif">
                    Định lượng chuẩn xác quá trình hấp thụ tư duy toán học bằng biểu đồ khoa học và nghiên cứu học thuật dựa trên dữ liệu người dùng thực.
                  </p>
                </div>

              </div>

            </div>
          </section>

          {/* 5. CORE ARCHITECTURE SECTION (4 LAYERS) */}
          <section id="architecture" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            
            <div className="text-center space-y-3 pb-12">
              <h2 className="text-xs uppercase font-extrabold text-indigo-400 tracking-widest font-mono">Cơ sở hạ tầng</h2>
              <h3 className="text-2xl sm:text-3xl font-black text-white">Kiến trúc Hệ thống 4 Lớp Cốt Lõi</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Bốn lớp công nghệ đan cài chặt chẽ kiến tạo nên tính thích ứng vượt trội của nền tảng Calculix Hub.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto items-stretch">
              
              {/* Tab Selector bar (4 cols) */}
              <div className="lg:col-span-4 flex flex-row lg:flex-col gap-2.5 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 select-none">
                <button
                  type="button"
                  onClick={() => { setActiveArchTab('engine'); setIsArchExpanded(false); }}
                  className={`w-full text-left p-4.5 rounded-2xl border text-xs font-extrabold transition-all shrink-0 cursor-pointer flex items-center justify-between ${
                    activeArchTab === 'engine'
                      ? 'bg-blue-600/10 border-blue-500 text-blue-400 shadow-md'
                      : 'bg-slate-900/40 border-slate-900 text-slate-400 hover:border-slate-800 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4" /> 1. Learning Engine
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 hidden lg:block transition-transform ${activeArchTab === 'engine' ? 'translate-x-1' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveArchTab('ai'); setIsArchExpanded(false); }}
                  className={`w-full text-left p-4.5 rounded-2xl border text-xs font-extrabold transition-all shrink-0 cursor-pointer flex items-center justify-between ${
                    activeArchTab === 'ai'
                      ? 'bg-blue-600/10 border-blue-500 text-blue-400 shadow-md'
                      : 'bg-slate-900/40 border-slate-900 text-slate-400 hover:border-slate-800 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Brain className="w-4 h-4" /> 2. AI Personalization
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 hidden lg:block transition-transform ${activeArchTab === 'ai' ? 'translate-x-1' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveArchTab('compete'); setIsArchExpanded(false); }}
                  className={`w-full text-left p-4.5 rounded-2xl border text-xs font-extrabold transition-all shrink-0 cursor-pointer flex items-center justify-between ${
                    activeArchTab === 'compete'
                      ? 'bg-blue-600/10 border-blue-500 text-blue-400 shadow-md'
                      : 'bg-slate-900/40 border-slate-900 text-slate-400 hover:border-slate-800 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Trophy className="w-4 h-4" /> 3. Competition System
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 hidden lg:block transition-transform ${activeArchTab === 'compete' ? 'translate-x-1' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveArchTab('analytics'); setIsArchExpanded(false); }}
                  className={`w-full text-left p-4.5 rounded-2xl border text-xs font-extrabold transition-all shrink-0 cursor-pointer flex items-center justify-between ${
                    activeArchTab === 'analytics'
                      ? 'bg-blue-600/10 border-blue-500 text-blue-400 shadow-md'
                      : 'bg-slate-900/40 border-slate-900 text-slate-400 hover:border-slate-800 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <BarChart3 className="w-4 h-4" /> 4. Analytics & Research
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 hidden lg:block transition-transform ${activeArchTab === 'analytics' ? 'translate-x-1' : ''}`} />
                </button>
              </div>

              {/* Tab Display Content (8 cols) */}
              <div className="lg:col-span-8 bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sm:p-8 flex flex-col justify-between backdrop-blur-md shadow-2xl relative transition-all duration-300">
                <div className="absolute top-4 right-4 text-slate-800 font-mono text-[9px]">Calculix Engine Core v2.6</div>
                
                <div className="space-y-5">
                  {activeArchTab === 'engine' && (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20 text-blue-400">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-black text-blue-400 tracking-wider">Cơ cấu rèn luyện</span>
                          <h4 className="text-base font-extrabold text-white">Learning Engine</h4>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed font-serif">
                        Học theo cấp độ phân bậc học thuật rõ rệt: <strong>Foundation</strong> (Nền tảng vững chãi), <strong>Advanced</strong> (Khai phá chuyên sâu), và <strong>Olympiad</strong> (Chinh phục học thuật quốc tế).
                      </p>
                      <ul className="space-y-2 text-[11px] text-slate-350">
                        <li className="flex gap-2">
                          <span className="text-blue-450 font-bold">•</span>
                          <span><strong>Học tập thích ứng (Adaptive Learning):</strong> Xóa bỏ hoàn toàn lộ trình học tuyến tính, nội dung tự động co giãn bám sát thực lực.</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-blue-450 font-bold">•</span>
                          <span><strong>Phân tích lỗi tức thời:</strong> Dựa trên dữ liệu thực để cảnh báo các lỗ hổng lý thuyết ngay sau khi làm bài.</span>
                        </li>
                      </ul>
                    </>
                  )}

                  {activeArchTab === 'ai' && (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/20 text-indigo-400">
                          <Brain className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-black text-indigo-400 tracking-wider">Lớp nhân dạng</span>
                          <h4 className="text-base font-extrabold text-white">AI Personalization Layer (EduReach Core)</h4>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed font-serif">
                        Thuật toán lõi EduReach phân tích sâu cấu trúc lời giải để phát hiện chính xác lỗ hổng cá nhân theo từng chủ đề hẹp (ví dụ: đếm hoán vị, phương pháp điểm rơi trong bất đẳng thức).
                      </p>
                      <ul className="space-y-2 text-[11px] text-slate-350">
                        <li className="flex gap-2">
                          <span className="text-indigo-405 font-bold">•</span>
                          <span><strong>Dự báo tiến bộ:</strong> Đưa ra mô hình toán học dự phóng khả năng cải thiện điểm số dựa trên tốc độ giải toán hiện tại.</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-indigo-405 font-bold">•</span>
                          <span><strong>Điều chỉnh đề bài thích ứng:</strong> Đưa ra bài tập kế tiếp có độ khó tối ưu để duy trì động lực học tập.</span>
                        </li>
                      </ul>
                    </>
                  )}

                  {activeArchTab === 'compete' && (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="bg-pink-500/10 p-2.5 rounded-xl border border-pink-500/20 text-pink-400">
                          <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-black text-pink-400 tracking-wider">Môi trường thi đấu</span>
                          <h4 className="text-base font-extrabold text-white">Competition Arena</h4>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed font-serif">
                        Đấu trường cọ xát trí tuệ trực tiếp với Weekly challenges, Monthly contests, và các giải đấu theo mùa (Seasonal tournaments).
                      </p>
                      <ul className="space-y-2 text-[11px] text-slate-350">
                        <li className="flex gap-2">
                          <span className="text-pink-450 font-bold">•</span>
                          <span><strong>Bảng xếp hạng thời gian thực:</strong> Chia nhóm Leaderboard theo độ tuổi và quốc gia của học sinh.</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-pink-450 font-bold">•</span>
                          <span><strong>Phân loại độ khó:</strong> Thử thách đa dạng từ Beginner đến Elite, cho phép người dùng tự lọc và đăng ký thi đấu.</span>
                        </li>
                      </ul>
                    </>
                  )}

                  {activeArchTab === 'analytics' && (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-400">
                          <BarChart3 className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-black text-emerald-400 tracking-wider">Hệ thống phân tích</span>
                          <h4 className="text-base font-extrabold text-white">Analytics & Research Dashboard</h4>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed font-serif">
                        Cung cấp Dashboard thống kê trực quan biểu đồ mạng nhện kỹ năng và thời gian học tập tương tác cho học sinh.
                      </p>
                      <ul className="space-y-2 text-[11px] text-slate-350">
                        <li className="flex gap-2">
                          <span className="text-emerald-450 font-bold">•</span>
                          <span><strong>Phân tích cho Nhà quản lý:</strong> Thu thập lỗi sai điển hình và xu hướng học tập thời gian thực phục vụ công tác giảng dạy của giáo viên.</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-emerald-450 font-bold">•</span>
                          <span><strong>Hỗ trợ nghiên cứu:</strong> Hỗ trợ xuất dữ liệu thô phục vụ nghiên cứu phương pháp toán học và viết báo cáo tác động.</span>
                        </li>
                      </ul>
                    </>
                  )}
                </div>

                {/* Expand Details Panel inside Tab */}
                <div className="pt-6 border-t border-slate-900 mt-6 space-y-4">
                  {isArchExpanded ? (
                    <div className="bg-slate-950/80 border border-slate-900 rounded-2xl p-4.5 text-[11px] text-slate-450 leading-relaxed space-y-3 font-mono animate-in slide-in-from-top-3 duration-200">
                      <div className="flex justify-between items-center text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                        <span>Thông số chuyên môn học thuật</span>
                        <span>MÔ HÌNH TOÁN HỌC IRT</span>
                      </div>
                      
                      {activeArchTab === 'engine' && (
                        <p>
                          Engine hoạt động dựa trên lý thuyết Vùng phát triển gần nhất (ZPD) của Vygotsky. Bài tập được phân phối sao cho xác suất làm đúng dự báo của học sinh luôn tiệm cận ngưỡng 0.65 để đảm bảo sự tiến bộ tối ưu mà không gây chán nản.
                        </p>
                      )}
                      
                      {activeArchTab === 'ai' && (
                        <div className="space-y-2">
                          <p>
                            {"Ứng dụng mô hình trắc nghiệm Rasch 1PL (1-Parameter Logistic) để định giá Theta (\\(\\theta\\)) biểu trưng cho năng lực tiềm ẩn của học sinh:"}
                          </p>
                          <div className="bg-slate-900 p-3 rounded-xl text-center text-indigo-300 font-bold">
                            {"\\[P_i(\\theta) = \\frac{e^{\\theta - b_i}}{1 + e^{\\theta - b_i}}\\]"}
                          </div>
                          <p className="text-[10px]">
                            {"Trong đó \\(b_i\\) là tham số độ khó của câu hỏi. Hệ thống tự động tối đa hóa thông tin Fisher để giảm thiểu sai số đo lường (SEM) nhanh nhất."}
                          </p>
                        </div>
                      )}
                      
                      {activeArchTab === 'compete' && (
                        <p>
                          Công thức xếp hạng ELO đấu trường áp dụng hiệu chỉnh độ chênh k-factor động. Hệ thống sẽ cộng nhiều điểm hơn khi bạn giải quyết bài toán có tham số độ khó vượt xa Theta hiện tại của bạn.
                        </p>
                      )}
                      
                      {activeArchTab === 'analytics' && (
                        <p>
                          Hệ cơ sở dữ liệu lớn thu thập gián tiếp qua telemetry của hàng ngàn lượt tương tác để tự động phân cụm (Clustering) các lỗi sai nhận thức phổ biến. Giúp nghiên cứu viên dự báo độ khó của các dạng bài mới.
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={() => setIsArchExpanded(false)}
                        className="text-[10px] font-bold text-blue-400 hover:underline block pt-1 cursor-pointer"
                      >
                        Thu gọn chi tiết [-]
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsArchExpanded(true)}
                      className="bg-slate-900 border border-slate-800 hover:border-slate-750 text-slate-350 hover:text-white font-bold text-[11px] px-4 py-2.5 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Xem chi tiết kiến trúc học thuật
                    </button>
                  )}
                </div>

              </div>

            </div>

          </section>

          {/* 6. COMMUNITY LAYER (MOCK STACKEXCHANGE FORUM) */}
          <section id="community" className="bg-slate-900/40 border-y border-slate-900 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="text-center space-y-3 pb-12">
                <h2 className="text-xs uppercase font-extrabold text-blue-500 tracking-widest font-mono">Cộng đồng học thuật</h2>
                <h3 className="text-2xl sm:text-3xl font-black text-white">Trao Đổi Học Thuật Chuẩn StackExchange</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Mô phỏng diễn đàn StackExchange thu nhỏ dành riêng cho học sinh chuyên toán thảo luận và phản biện lời giải.
                </p>
              </div>

              {/* StackExchange Mock Box with Dark/Light mode toggle */}
              <div className="max-w-4xl mx-auto space-y-4">
                
                {/* Mode Controller header */}
                <div className="flex justify-between items-center bg-slate-900 border border-slate-800 px-6 py-3.5 rounded-2xl select-none">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" /> Bảng thử nghiệm Diễn đàn Cộng đồng
                  </span>
                  <button
                    type="button"
                    onClick={() => setCommunityDarkMode(!communityDarkMode)}
                    className="bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white font-bold text-[10px] px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    {communityDarkMode ? (
                      <><Sun className="w-3.5 h-3.5 text-amber-400" /> Chuyển sang Light Mode</>
                    ) : (
                      <><Moon className="w-3.5 h-3.5 text-indigo-400" /> Chuyển sang Dark Mode</>
                    )}
                  </button>
                </div>

                {/* Forum Body Container */}
                <div className={`border rounded-3xl p-6 transition-all duration-300 shadow-xl space-y-6 ${
                  communityDarkMode 
                    ? 'bg-slate-900/90 border-slate-800 text-slate-200 shadow-slate-950/20' 
                    : 'bg-white border-slate-200 text-slate-800 shadow-slate-200/50'
                }`}>
                  
                  {/* Forum Title Thread */}
                  <div className="border-b pb-4 flex justify-between items-start gap-4" style={{ borderColor: communityDarkMode ? '#1e293b' : '#f1f5f9' }}>
                    <div className="space-y-1">
                      <h4 className={`text-base font-black tracking-tight leading-tight ${communityDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Làm thế nào để chứng minh Bất đẳng thức Cauchy-Schwarz dạng cộng mẫu (Shed-Titu) bằng Vector?
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-medium">
                        <span>Đăng bởi: <strong className="text-blue-500">Lê Hoài Nam</strong> (Hạng 5)</span>
                        <span>Hoạt động: 2 giờ trước</span>
                        <span>Lượt xem: 1,280</span>
                      </div>
                    </div>
                    <span className="bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-[8px] font-black uppercase px-2 py-0.5 rounded shrink-0">
                      Bất đẳng thức
                    </span>
                  </div>

                  {/* Thread Message 1 (Question) */}
                  <div className="flex gap-4 items-start">
                    
                    {/* Voting rail */}
                    <div className="flex flex-col items-center gap-2 select-none shrink-0">
                      <button
                        type="button"
                        onClick={() => setMockVotes(prev => ({ ...prev, 'disc-1': prev['disc-1'] + 1 }))}
                        className="hover:scale-115 transition-transform text-slate-500 hover:text-blue-500 cursor-pointer"
                        title="Hữu ích"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <span className="font-mono font-black text-sm tracking-tight">{mockVotes['disc-1']}</span>
                      <button
                        type="button"
                        onClick={() => setMockVotes(prev => ({ ...prev, 'disc-1': Math.max(0, prev['disc-1'] - 1) }))}
                        className="hover:scale-115 transition-transform text-slate-500 hover:text-rose-500 cursor-pointer"
                        title="Không hữu ích"
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Question Content */}
                    <div className="flex-1 space-y-2">
                      <p className="text-xs leading-relaxed font-serif">
                        {"Em đang ôn thi HSG chuyên Toán và gặp bài toán áp dụng Cauchy-Schwarz dạng cộng mẫu \\(\\sum \\frac{x_i^2}{a_i} \\ge \\frac{(\\sum x_i)^2}{\\sum a_i}\\). Em biết cách chứng minh dùng quy nạp toán học hoặc AM-GM, nhưng em nghe nói có cách chứng minh bằng định nghĩa tích vô hướng của 2 Vector rất đẹp. Các thầy và các bạn có thể hướng dẫn chi tiết được không ạ?"}
                      </p>
                      
                      {/* Tags */}
                      <div className="flex gap-1.5 pt-1">
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded ${communityDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>algebra</span>
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded ${communityDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>cauchy-schwarz</span>
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded ${communityDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>vector</span>
                      </div>
                    </div>

                  </div>

                  {/* Thread Answer (Reply) */}
                  <div className="border-t pt-5 pl-8 space-y-4" style={{ borderColor: communityDarkMode ? '#1e293b' : '#f1f5f9' }}>
                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                      <span className="font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Lời giải được chấp nhận (Accepted Answer)
                      </span>
                      <span className="font-mono">1 ngày trước</span>
                    </div>

                    <div className="flex gap-4 items-start">
                      {/* Voting rail for reply */}
                      <div className="flex flex-col items-center gap-2 select-none shrink-0">
                        <button
                          type="button"
                          onClick={() => setMockVotes(prev => ({ ...prev, 'disc-2': prev['disc-2'] + 1 }))}
                          className="hover:scale-115 transition-transform text-slate-500 hover:text-blue-500 cursor-pointer"
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <span className="font-mono font-black text-sm tracking-tight">{mockVotes['disc-2']}</span>
                        <button
                          type="button"
                          onClick={() => setMockVotes(prev => ({ ...prev, 'disc-2': Math.max(0, prev['disc-2'] - 1) }))}
                          className="hover:scale-115 transition-transform text-slate-500 hover:text-rose-500 cursor-pointer"
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Reply content */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className={`text-[11px] font-bold ${communityDarkMode ? 'text-slate-350' : 'text-slate-700'}`}>
                            Thầy Hoàng (Mentor) 🧠
                          </span>
                          <span className="bg-blue-600/10 text-blue-450 border border-blue-500/10 text-[8px] font-black px-1.5 py-0.25 rounded uppercase">
                            Ban chuyên môn
                          </span>
                        </div>

                        <p className="text-xs leading-relaxed font-serif">
                          {"Chào em, chứng minh bằng Vector cực kỳ ngắn gọn và trực quan. Hãy xét hai Vector trong không gian n chiều:"}
                          <br /><br />
                          {"\\(\\vec{u} = \\left( \\frac{x_1}{\\sqrt{a_1}}, \\frac{x_2}{\\sqrt{a_2}}, \\dots, \\frac{x_n}{\\sqrt{a_n}} \\right)\\) và \\(\\vec{v} = (\\sqrt{a_1}, \\sqrt{a_2}, \\dots, \\sqrt{a_n})\\)"}
                          <br /><br />
                          {"Theo bất đẳng thức tích vô hướng hình học Cauchy-Schwarz: \\((\\vec{u} \\cdot \\vec{v})^2 \\le \\|\\vec{u}\\|^2 \\cdot \\|\\vec{v}\\|^2\\)"}
                          <br /><br />
                          {"Tính tích vô hướng: \\(\\vec{u} \\cdot \\vec{v} = \\sum \\frac{x_i}{\\sqrt{a_i}} \\cdot \\sqrt{a_i} = \\sum x_i\\)"}
                          <br />
                          {"Tính độ dài bình phương: \\(\\|\\vec{u}\\|^2 = \\sum \\frac{x_i^2}{a_i}\\) và \\(\\|\\vec{v}\\|^2 = \\sum a_i\\)"}
                          <br /><br />
                          {"Thay tất cả vào ta thu được ngay bất đẳng thức cộng mẫu: \\((\\sum x_i)^2 \\le (\\sum \\frac{x_i^2}{a_i}) \\cdot (\\sum a_i)\\). Chia hai vế cho \\(\\sum a_i\\) (vì a_i > 0), ta có điều phải chứng minh. Đẳng thức xảy ra khi và chỉ khi hai vector cùng phương, tức là \\(\\frac{x_i}{a_i}\\) bằng hằng số với mọi i."}
                        </p>

                        <div className="flex justify-between items-center pt-3 text-[10px] text-slate-500">
                          <button type="button" className="hover:text-blue-500 flex items-center gap-1 font-bold cursor-pointer">
                            <MessageSquare className="w-3.5 h-3.5" /> 5 bình luận lồng nhau
                          </button>
                          <button type="button" className="hover:text-rose-500 flex items-center gap-1 font-bold cursor-pointer">
                            ⚠️ Báo cáo nội dung
                          </button>
                        </div>

                      </div>
                    </div>

                  </div>

                </div>

              </div>

            </div>
          </section>

          {/* 7. USER FLOW (TIMELINE) */}
          <section id="flow" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            
            <div className="text-center space-y-3 pb-16">
              <h2 className="text-xs uppercase font-extrabold text-blue-500 tracking-widest font-mono">Quy trình rèn luyện</h2>
              <h3 className="text-2xl sm:text-3xl font-black text-white">Hành Trình Tối Ưu Năng Lực Toán Học</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto font-serif">
                Quy trình khép kín giúp khai phóng tiềm năng của học viên qua từng bước cụ thể.
              </p>
            </div>

            {/* Horizontal/Vertical Timeline grid with micro-animations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 max-w-6xl mx-auto relative">
              
              {/* Step 1 */}
              <div 
                onMouseEnter={() => setHoveredStep(1)}
                onMouseLeave={() => setHoveredStep(null)}
                className={`bg-slate-900/40 border p-5 rounded-2xl space-y-3 transition-all duration-300 relative select-none ${
                  hoveredStep === 1 
                    ? 'border-blue-500 scale-[1.03] bg-slate-900 shadow-lg shadow-blue-950/10' 
                    : 'border-slate-900 hover:border-slate-800'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono font-black text-blue-400">STEP 01</span>
                  <BookOpen className="w-4.5 h-4.5 text-blue-400" />
                </div>
                <h4 className="font-extrabold text-xs text-white">Làm test đầu vào</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-serif">
                  Hoàn thành 4 bài kiểm tra nhỏ đại diện cho 4 miền kiến thức để dò tìm Theta (θ) ban đầu.
                </p>
              </div>

              {/* Step 2 */}
              <div 
                onMouseEnter={() => setHoveredStep(2)}
                onMouseLeave={() => setHoveredStep(null)}
                className={`bg-slate-900/40 border p-5 rounded-2xl space-y-3 transition-all duration-300 relative select-none ${
                  hoveredStep === 2 
                    ? 'border-indigo-500 scale-[1.03] bg-slate-900 shadow-lg shadow-indigo-950/10' 
                    : 'border-slate-900 hover:border-slate-800'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono font-black text-indigo-400">STEP 02</span>
                  <Brain className="w-4.5 h-4.5 text-indigo-400" />
                </div>
                <h4 className="font-extrabold text-xs text-white">AI phân tích lỗi</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-serif">
                  EduReach Core quét các bước suy luận toán để phát hiện lỗi logic hệ thống.
                </p>
              </div>

              {/* Step 3 */}
              <div 
                onMouseEnter={() => setHoveredStep(3)}
                onMouseLeave={() => setHoveredStep(null)}
                className={`bg-slate-900/40 border p-5 rounded-2xl space-y-3 transition-all duration-300 relative select-none ${
                  hoveredStep === 3 
                    ? 'border-purple-500 scale-[1.03] bg-slate-900 shadow-lg shadow-purple-950/10' 
                    : 'border-slate-900 hover:border-slate-800'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono font-black text-purple-400">STEP 03</span>
                  <Shield className="w-4.5 h-4.5 text-purple-400" />
                </div>
                <h4 className="font-extrabold text-xs text-white">Nhận lộ trình riêng</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-serif">
                  Đồng bộ bài giảng và bài tập thích ứng riêng biệt, liên tục cập nhật theo tiến trình.
                </p>
              </div>

              {/* Step 4 */}
              <div 
                onMouseEnter={() => setHoveredStep(4)}
                onMouseLeave={() => setHoveredStep(null)}
                className={`bg-slate-900/40 border p-5 rounded-2xl space-y-3 transition-all duration-300 relative select-none ${
                  hoveredStep === 4 
                    ? 'border-pink-500 scale-[1.03] bg-slate-900 shadow-lg shadow-pink-950/10' 
                    : 'border-slate-900 hover:border-slate-800'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono font-black text-pink-400">STEP 04</span>
                  <Trophy className="w-4.5 h-4.5 text-pink-400" />
                </div>
                <h4 className="font-extrabold text-xs text-white">Luyện tập & Thi đấu</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-serif">
                  Rèn luyện phản xạ qua Learning Engine và tham gia đấu trường phân hạng ELO hàng tuần.
                </p>
              </div>

              {/* Step 5 */}
              <div 
                onMouseEnter={() => setHoveredStep(5)}
                onMouseLeave={() => setHoveredStep(null)}
                className={`bg-slate-900/40 border p-5 rounded-2xl space-y-3 transition-all duration-300 relative select-none ${
                  hoveredStep === 5 
                    ? 'border-emerald-500 scale-[1.03] bg-slate-900 shadow-lg shadow-emerald-950/10' 
                    : 'border-slate-900 hover:border-slate-800'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono font-black text-emerald-400">STEP 05</span>
                  <BarChart3 className="w-4.5 h-4.5 text-emerald-400" />
                </div>
                <h4 className="font-extrabold text-xs text-white">Theo dõi tiến bộ</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-serif">
                  Kiểm tra radar năng lực, thời gian học và xu hướng tiến bộ chính xác qua Dashboard cá nhân.
                </p>
              </div>

              {/* Step 6 */}
              <div 
                onMouseEnter={() => setHoveredStep(6)}
                onMouseLeave={() => setHoveredStep(null)}
                className={`bg-slate-900/40 border p-5 rounded-2xl space-y-3 transition-all duration-300 relative select-none ${
                  hoveredStep === 6 
                    ? 'border-amber-500 scale-[1.03] bg-slate-900 shadow-lg shadow-amber-950/10' 
                    : 'border-slate-900 hover:border-slate-800'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono font-black text-amber-400">STEP 06</span>
                  <Users className="w-4.5 h-4.5 text-amber-400" />
                </div>
                <h4 className="font-extrabold text-xs text-white">Cộng đồng bình duyệt</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-serif">
                  Tham gia thảo luận chuyên sâu, upvote lời giải tốt và nhận đánh giá từ các Mentor.
                </p>
              </div>

            </div>

          </section>

          {/* 8. SOCIAL MEDIA (ACQUISITION CHANNELS VS HUB) */}
          <section className="bg-slate-900/40 border-y border-slate-900 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-5xl mx-auto">
                
                <div className="lg:col-span-6 space-y-5 text-center lg:text-left">
                  <h3 className="text-xs uppercase font-extrabold text-indigo-400 tracking-widest font-mono">Kênh phễu người dùng</h3>
                  <h4 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    Mạng xã hội chỉ là phễu dẫn dòng (Acquisition Channel)
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-serif">
                    Calculix Hub phân định rõ ràng: các trang Facebook, TikTok hay kênh YouTube chỉ đóng vai trò phân phối nội dung truyền thông và thu hút người dùng. Toàn bộ trải nghiệm học tập, dữ liệu thích ứng và giá trị học thuật cốt lõi được bảo tồn duy nhất bên trong nền tảng <strong>Calculix Hub</strong>.
                  </p>
                </div>

                <div className="lg:col-span-6 space-y-4">
                  
                  {/* Facebook card */}
                  <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 flex items-center justify-between transition-all hover:border-blue-900/50">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-600/10 p-2.5 rounded-xl text-blue-500">
                        <Facebook className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-extrabold text-xs text-slate-200">Facebook Chuyên Toán</h5>
                        <p className="text-[9px] text-slate-500 font-medium">Chia sẻ các chuyên đề thi HSG & Olympic sâu</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-white font-mono">{liveStats.facebookAcquisitions.toLocaleString()}</span>
                      <span className="text-[8px] text-slate-550 block font-bold">User được kéo</span>
                    </div>
                  </div>

                  {/* TikTok card */}
                  <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 flex items-center justify-between transition-all hover:border-indigo-900/50">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-600/10 p-2.5 rounded-xl text-indigo-400">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-extrabold text-xs text-slate-200">TikTok Short Education</h5>
                        <p className="text-[9px] text-slate-500 font-medium">Video 60 giây giải mã câu đố logic thú vị</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-white font-mono">{liveStats.tiktokAcquisitions.toLocaleString()}</span>
                      <span className="text-[8px] text-slate-550 block font-bold">User được kéo</span>
                    </div>
                  </div>

                  {/* YouTube card */}
                  <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 flex items-center justify-between transition-all hover:border-red-900/50">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-600/10 p-2.5 rounded-xl text-red-500">
                        <Youtube className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-extrabold text-xs text-slate-200">YouTube Deep-dive Lectures</h5>
                        <p className="text-[9px] text-slate-500 font-medium">Video chữa đề thi chi tiết từ ban chuyên môn</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-white font-mono">{liveStats.youtubeAcquisitions.toLocaleString()}</span>
                      <span className="text-[8px] text-slate-550 block font-bold">User được kéo</span>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </section>

          {/* 9. OUTPUT & EXPECTED IMPACT SECTION */}
          <section id="impact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            
            <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-[32px] p-6 sm:p-10 relative overflow-hidden shadow-2xl">
              
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                
                <div className="md:col-span-8 space-y-5">
                  <span className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-black uppercase px-3 py-1.5 rounded-full tracking-wider block w-fit">
                    Nghiên cứu khoa học & Tác động xã hội
                  </span>
                  
                  <h4 className="text-2xl font-black text-white tracking-tight">
                    Báo cáo Tác động Giáo dục học thuật của Calculix Hub
                  </h4>
                  
                  <p className="text-xs text-slate-405 leading-relaxed font-serif">
                    Calculix cam kết duy trì tính minh bạch tối đa. Mọi số liệu đo lường về mức độ tiến bộ của học viên và số lượng kết nối trực tuyến đều dựa trên hoạt động thực tế thời gian thực của hệ thống, hỗ trợ kết xuất báo cáo chuẩn học thuật phục vụ mục đích nghiên cứu giáo dục.
                  </p>

                  {/* Impact Statistics */}
                  <div className="space-y-4 pt-2">
                    
                    {/* Active growth bar (1,000 to 10,000 target) */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400">
                        <span>Số lượng học viên tích cực hàng tháng (Quy mô hiện tại: {liveStats.activeUsers})</span>
                        <span className="text-blue-400 font-mono">Mục tiêu: 10,000</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 border border-slate-850">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min(100, (liveStats.activeUsers / 10000) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Improvement Rate */}
                    <div className="flex items-center gap-8 text-center pt-2">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-500 block">Tỷ lệ tiến bộ thực tế</span>
                        <span className="text-2xl font-black text-emerald-400 font-mono block mt-0.5">{liveStats.improvementRate}%</span>
                        <span className="text-[8px] text-slate-500 block">Tăng điểm số sau 3 tháng</span>
                      </div>
                      <div className="border-l border-slate-800 pl-8">
                        <span className="text-[9px] uppercase font-bold text-slate-500 block">Lượt cọ xát hàng tháng</span>
                        <span className="text-2xl font-black text-white font-mono block mt-0.5">4,500+</span>
                        <span className="text-[8px] text-slate-555 block">Đăng ký đấu trường</span>
                      </div>
                    </div>

                  </div>

                </div>

                <div className="md:col-span-4 text-center">
                  <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl space-y-4">
                    <FileText className="w-10 h-10 text-indigo-400 mx-auto animate-bounce" />
                    <div>
                      <h5 className="font-extrabold text-xs text-slate-200">Xuất Báo Cáo Tác Động</h5>
                      <p className="text-[9px] text-slate-500 mt-1 leading-normal">Báo cáo minh bạch được biên soạn động từ cơ sở dữ liệu.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleExportImpactReport}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" /> Tải báo cáo PDF
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </section>

        </main>

        {/* 10. LANDING FOOTER */}
        <footer className="border-t border-slate-900 py-12 bg-slate-950 text-slate-500 select-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl text-slate-400 font-bold w-9 h-9 flex items-center justify-center text-sm">
                C
              </div>
              <div>
                <h5 className="font-extrabold text-xs tracking-wider text-slate-350 uppercase">Calculix Hub</h5>
                <span className="text-[9px] block text-slate-600 font-medium">Học Toán thích ứng qua dữ liệu thực tế</span>
              </div>
            </div>
            <div className="text-[10px] text-center md:text-right space-y-1 leading-relaxed">
              <p>© 2026 Calculix Platform. Được khuyên dùng bởi Ban Chuyên Môn Olympic Toán học.</p>
              <p>Mã nguồn mở phi lợi nhuận. Giáo dục toán học chất lượng cao cho mọi người.</p>
            </div>
          </div>
        </footer>

      </div>
    );
  };

  if (authMode === 'landing') {
    return renderLandingPage();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-slate-900 selection:text-white">
      {/* Decorative ambient background glows */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-2/3 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main landing container */}
      <div className="w-full min-h-screen bg-white grid grid-cols-1 md:grid-cols-12 relative z-10 transition-all duration-300">
        
        {/* Left column: Value Proposition & Interactive Features (4 cols) */}
        <div className="md:col-span-4 bg-slate-950 text-slate-300 p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-48 h-48 bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-6">
            {/* Branding */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-blue-500 to-indigo-600 p-2.5 rounded-xl text-white font-black w-10 h-10 flex items-center justify-center text-lg shadow-lg">
                C
              </div>
              <div>
                <h1 className="font-extrabold text-sm tracking-widest text-slate-100 uppercase">Calculix Hub</h1>
                <span className="text-[10px] font-bold text-slate-500 block -mt-1 uppercase tracking-wider">Math OS Platform</span>
              </div>
            </div>

            {/* Core messaging */}
            <div className="space-y-3 pt-6">
              <h2 className="text-xl font-black text-white leading-tight">
                Ứng dụng mô hình Adaptive Test - Công nghệ IRT
              </h2>
              <p className="text-[11px] text-slate-400 leading-relaxed font-serif">
                Calculix Hub ứng dụng Lý thuyết phản hồi câu hỏi (Item Response Theory - IRT) chuẩn AMC & Olympiad để chuẩn hóa lộ trình tư duy phù hợp nhất với năng lực thực chất của bạn.
              </p>
            </div>

            {/* Feature pillars checklist */}
            <div className="space-y-4 pt-4">
              <div className="flex gap-2.5 items-start">
                <div className="bg-blue-500/10 p-1.5 rounded-lg border border-blue-500/20 text-blue-400 shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">Đánh giá thích ứng CAT</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Tự động chọn độ khó của từng câu theo khả năng thực tế.</p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <div className="bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/20 text-emerald-400 shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">Bản đồ năng lực chính xác</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Xác định điểm hội tụ Theta (θ) và thu hẹp biên độ sai số (SEM).</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Trust Watermark */}
          <div className="pt-8 border-t border-slate-900 mt-8 space-y-3.5 text-[10px] text-slate-500">
            <div>
              <span className="block font-semibold text-slate-350">⚡ Phiên bản 2.6 Academic Core</span>
              <span className="block mt-0.5">Mô hình toán thích ứng IRT - Hệ sinh thái phi thương mại.</span>
            </div>
            <p className="border-t border-slate-900/60 pt-3 leading-relaxed text-slate-400">
              ⚡ Hệ sinh thái học tập tuân thủ trọn vẹn tiêu chuẩn cấu trúc nội lực <b>EduReach Analytics Core</b>.
            </p>
          </div>
        </div>

        {/* Right column: Authentication & Placement Card (8 cols) */}
        <div className="md:col-span-8 p-8 md:p-16 flex flex-col justify-center bg-white min-h-screen">
          
          {/* LANDING MAIN VIEW CONTAINER */}
          {authMode === 'landing' && (
            <div className="space-y-6 text-center md:text-left animate-in fade-in zoom-in duration-200">
              <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full text-[10px] font-black uppercase text-indigo-700 tracking-wider">
                <Star className="w-3.5 h-3.5 text-indigo-600 fill-indigo-100" /> Hệ điều hành Chuyên Toán
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  Chào mừng bạn đến với Calculix Hub!
                </h3>
                <p className="text-xs text-slate-550 max-w-lg leading-relaxed font-serif">
                  Trải nghiệm nền tảng học Toán thông minh với công nghệ định hình năng học thích ứng IRT. Vui lòng đăng nhập hoặc đăng ký tài khoản để tiếp tục.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="bg-slate-900 hover:bg-black text-white font-extrabold text-xs px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  Đăng ký thành viên mới <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-6 py-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Đăng nhập tài khoản
                </button>
              </div>
            </div>
          )}

          {/* SIGN IN VIEW CONTAINER */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <button
                type="button"
                onClick={() => { setAuthMode('landing'); setErrorMessage(''); }}
                className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-800 text-xs font-bold mb-2 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Quay lại
              </button>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Chào mừng quay trở lại</h3>
                <p className="text-[11px] text-slate-500 animate-pulse">
                  Hạ cánh an toàn xuống Calculix Hub - Nhập thông tin tài khoản của bạn để đăng nhập.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-medium space-y-2">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>Lỗi Xác Thực Tài Khoản</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">{errorMessage}</p>
                </div>
              )}

              <div className="space-y-3.5 pt-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 block">Mã thư thâm nhập (Email Địa Chỉ)</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="ten_nguoi_dung@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-slate-200 focus:border-slate-900 rounded-xl pl-10 pr-3.5 py-3 text-xs outline-hidden font-medium text-slate-800 placeholder:text-slate-400 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 block">Mã bảo đảm (Mật Khẩu)</label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="Mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-slate-200 focus:border-slate-900 rounded-xl pl-10 pr-3.5 py-3 text-xs outline-hidden font-medium text-slate-800 placeholder:text-slate-400 bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-2.5">
                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-black text-white text-xs font-extrabold py-3.5 rounded-xl shadow-md cursor-pointer flex justify-center items-center gap-1.5"
                >
                  Xác thực & Thâm nhập
                </button>
                
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="text-center text-[11px] font-bold text-indigo-600 hover:underline pt-2 cursor-pointer"
                >
                  Bạn chưa có tài khoản? Nhấn vào đây để đăng kí tài khoản miễn phí →
                </button>
              </div>
            </form>
          )}

          {/* SIGN UP / REGISTER NEW PROFILE CONTAINER */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <button
                type="button"
                onClick={() => { setAuthMode('landing'); setErrorMessage(''); }}
                className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-800 text-xs font-bold mb-1 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Quay lại
              </button>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Đăng ký thành viên mới</h3>
                <p className="text-[11px] text-slate-500">
                  Khởi tạo tài khoản hệ thống, sau đó trực tiếp thực thi bài kiểm tra thích ứng IRT để phân bậc kỹ năng.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-150 text-rose-850 rounded-xl text-xs font-medium flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-150 text-emerald-800 rounded-xl text-xs font-semibold animate-bounce">
                  🎉 {successMessage}
                </div>
              )}

              <div className="space-y-3 pt-1">
                {/* Full name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 block">Danh tính đầy đủ (Họ và Tên)</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Nguyễn Văn A"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full border border-slate-200 focus:border-slate-900 rounded-xl pl-10 pr-3.5 py-3 text-xs outline-hidden font-medium text-slate-800 placeholder:text-slate-400 bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* Email address */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 block">Mã thư tín chỉ định (Email)</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="ten_nguoi_dung@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-slate-200 focus:border-slate-900 rounded-xl pl-10 pr-3.5 py-3 text-xs outline-hidden font-medium text-slate-800 placeholder:text-slate-400 bg-slate-50/50"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 block">Khóa mật an ninh tự chọn</label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="Mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-slate-200 focus:border-slate-900 rounded-xl pl-10 pr-3.5 py-3 text-xs outline-hidden font-medium text-slate-800 placeholder:text-slate-400 bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-black text-white text-xs font-extrabold py-3.5 rounded-xl shadow-md cursor-pointer justify-center items-center flex gap-1.5"
                >
                  Xác nhận hồ sơ & Làm bài Test IRT <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-center text-[11px] font-bold text-indigo-600 hover:underline pt-1.5 cursor-pointer"
                >
                  Tôi đã là thành viên? Trở lại Khách đăng nhập →
                </button>
              </div>
            </form>
          )}

          {/* PLACEMENT TEST / DIAGNOSTIC ASSESSMENT CONTAINER */}
          {authMode === 'placement' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
              
              {!testCompleted ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left column: Active Question (7 cols) */}
                  <div className="lg:col-span-7 space-y-4">
                    
                    {/* Header */}
                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider block w-fit mb-1">
                          Phân môn {activeStage + 1}/4: {currentQuestion.topic}
                        </span>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Hệ Thống Thích Ứng Adaptive Test
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono font-black text-slate-700 bg-slate-100 px-2 py-1 rounded">
                        b = {currentQuestion.difficulty.toFixed(1)}
                      </span>
                    </div>

                    {/* Question representation */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-xs">
                      <p className="text-slate-800 text-xs font-bold font-serif leading-relaxed">
                        {currentQuestion.question}
                      </p>
                    </div>

                    {errorMessage && (
                      <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-[10px] font-semibold">
                        ⚠️ {errorMessage}
                      </div>
                    )}

                    {/* Question Answers Selection */}
                    <div className="space-y-2">
                      {currentQuestion.options.map((option, oIdx) => {
                        const isSelected = selectedAnswerIdx === oIdx;
                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => setSelectedAnswerIdx(oIdx)}
                            className={`w-full p-3.5 text-left text-xs rounded-xl border transition-all duration-150 cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-50/40 text-indigo-900 font-bold shadow-xs scale-[1.01]'
                                : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-650'
                            }`}
                          >
                            <span>{option}</span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                              isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                            }`}>
                              {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Hint element */}
                    <div className="bg-amber-50/30 border border-amber-200/40 rounded-xl p-3 flex gap-2">
                      <HelpCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-bold text-slate-600 block">Gợi ý phân mẫu:</span>
                        <p className="text-[9px] text-slate-500 mt-0.5 leading-relaxed">{currentQuestion.hint}</p>
                      </div>
                    </div>

                    {/* Dynamic Action submissions */}
                    <button
                      type="button"
                      onClick={handleNextIrtQuestion}
                      className="w-full bg-slate-900 hover:bg-black text-white text-xs font-extrabold py-3.5 rounded-xl transition-all cursor-pointer flex justify-center items-center gap-1"
                    >
                      {activeStage < 3 ? (
                        <>Tính toán và Tiếp tục <ChevronRight className="w-4 h-4" /></>
                      ) : (
                        <>Hoàn thành bài Test & Xếp lớp <CheckCircle2 className="w-4 h-4" /></>
                      )}
                    </button>

                  </div>

                  {/* Right column: Interactive IRT Analytics Panel HUD (5 cols) */}
                  <div className="lg:col-span-5 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-150">
                      <Activity className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                      <h4 className="text-[10px] font-black uppercase text-slate-800 tracking-wider">
                        Phân tích IRT Hệ Học Thích Ứng
                      </h4>
                    </div>

                    {/* Live Ability Meter Grid */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[9px] font-bold text-slate-500">
                        <span>Chỉ số năng lực θ (Theta)</span>
                        <span className="text-indigo-700 font-mono">
                          {theta > 0 ? '+' : ''}{theta.toFixed(2)}
                        </span>
                      </div>

                      {/* Slider representing Theta spectrum */}
                      <div className="relative w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        {/* Map -3.0 to +3.0 onto 0% to 100% */}
                        <div 
                          className="absolute h-full bg-indigo-600 transition-all duration-300"
                          style={{ width: `${((theta + 3.0) / 6.0) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[8px] text-slate-400 font-mono">
                        <span>-3.0 (Cơ bản)</span>
                        <span>0.0 (Khá)</span>
                        <span>+3.0 (Olympiad)</span>
                      </div>
                    </div>

                    {/* live SEM progress */}
                    <div className="p-2.5 bg-white border border-slate-150 rounded-xl grid grid-cols-2 gap-2 text-center">
                      <div>
                        <span className="text-[8px] uppercase text-slate-400 font-bold block">Sai số ước lượng (SEM)</span>
                        <span className="text-xs font-black text-slate-800 font-mono block mt-0.5">± {sem.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-[8px] uppercase text-slate-400 font-bold block">Độ tin cậy toán học</span>
                        <span className="text-xs font-black text-emerald-600 block mt-0.5">
                          {sem > 1.5 ? 'Chưa định ví' : sem > 1.0 ? 'Đang định vị' : 'Độ chuẩn cao ✔'}
                        </span>
                      </div>
                    </div>

                    {/* Current temporary computed level */}
                    <div className="p-2.5 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-center justify-between text-xs">
                      <span className="text-[9px] text-indigo-900 font-bold flex items-center gap-1">
                        <BarChart3 className="w-3.5 h-3.5" /> Trình độ định hướng
                      </span>
                      <span className="bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">
                        {theta < -0.5 ? 'Foundation' : theta < 1.2 ? 'Advanced' : 'Olympiad'}
                      </span>
                    </div>

                    {/* Simulated live IRT system console/logs */}
                    <div className="space-y-1">
                      <span className="text-[8px] uppercase text-slate-400 font-extrabold block">Nhật ký máy tính IRT:</span>
                      <div className="h-28 overflow-y-auto border border-slate-200 bg-slate-900 text-[8px] p-2 rounded-lg font-mono text-emerald-400 space-y-1 select-none">
                        {irtLog.map((logLine, lIdx) => (
                          <div key={lIdx} className="leading-normal animate-fade-in">
                            {logLine}
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              ) : (
                /* PLACEMENT TEST COMPLETED - EVALUATION SCREEN */
                <div className="space-y-5 py-4 animate-in zoom-in-95 duration-350 text-center">
                  <div className="mx-auto w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center shadow-md">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-slate-900">Tính toán kết cục năng lực IRT thành công!</h3>
                    <p className="text-xs text-slate-500 font-serif max-w-sm mx-auto leading-relaxed">
                      Lộ trình bài viết và kho câu hỏi đã được đồng bộ chuẩn hóa thích hợp tuyệt đối theo năng lực số học thực tế của bạn.
                    </p>
                  </div>

                  {/* Performance stats summary */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 max-w-lg mx-auto grid grid-cols-3 gap-4">
                    <div className="border-r border-slate-200">
                      <span className="text-[9px] uppercase font-bold text-slate-400">Ước lượng liên tục</span>
                      <p className="text-base font-extrabold text-indigo-700 mt-0.5 font-mono">θ = {theta.toFixed(2)}</p>
                    </div>
                    <div className="border-r border-slate-200">
                      <span className="text-[9px] uppercase font-bold text-slate-400">Hội tụ chính xác</span>
                      <p className="text-base font-extrabold text-slate-800 mt-0.5 font-mono">SEM {sem.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400">Trình độ xếp lớp</span>
                      <span className="block text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md w-fit mx-auto mt-1 border border-emerald-150">
                        {calculatedLevel}
                      </span>
                    </div>
                  </div>

                  <div className="text-left text-[11px] text-slate-600 space-y-1.5 max-w-md mx-auto bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="font-bold text-slate-705 flex gap-1.5 items-center">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> Hồ sơ năng lực liên thông hoạt động:
                    </p>
                    <ul className="list-disc pl-4 space-y-1.5 text-slate-500 text-[10px]">
                      <li>Ưu tiên phân phối các bài tập thuộc bảng đấu <strong className="text-indigo-600">{calculatedLevel}</strong>.</li>
                      <li>Khởi tạo cơ chế toán suy nghĩ sâu (deep-thinking reasoning logic) cho AI Tutor.</li>
                      <li>Cho phép đăng ký thi tuần và gia nhập bảng lãnh đạo tương tác cùng các đồng nghiệp có chung trình độ.</li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={handleFinishPlacement}
                    className="w-full bg-slate-950 hover:bg-black text-white text-xs font-extrabold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer flex justify-center items-center gap-1.5"
                  >
                    Khởi động hệ điều hành Chuyên Toán ngay <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
