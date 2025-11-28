import React, { useState, useEffect } from "react";
import {
  RotateCcw,
  Play,
  Minus,
  Plus,
  ChevronDown,
  Printer,
  Heart,
  Loader,
  Mail,
  MessageSquare,
  HelpCircle
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceDot
} from 'recharts';

const COLORS = {
  primary: "#56C596", // Mint Green
  primaryDark: "#3aa87b",
  bg: "#FAFAFA",
  card: "#FFFFFF",
  textMain: "#1A1A1A",
  textSecondary: "#9CA3AF",
  border: "#F3F4F6",
  inputBg: "#F9FAFB",
  accentLight: "#E6F7F0",
  blue: "#5D9CEC",
  yellow: "#F59E0B",
  red: "#FF6B6B",
  orange: "#F2994A",
  orangeLight: "#FFF7ED",
  saveGreen: "#4D7C0F",
  tableHeader: "#2563EB"
};

interface CalculatorValues {
  currentAge: string;
  income: string;
  savings: string;
  contributions: string;
  budget: string;
  otherIncome: string;
  retirementAge: string;
  lifeExpectancy: string;
  preRetireRate: string;
  postRetireRate: string;
  inflation: string;
  incomeIncrease: string;
  contributionMode: "$" | "%";
  budgetMode: "$" | "%";
}

interface CalculatorData {
  values: CalculatorValues;
  touched: Partial<Record<keyof CalculatorValues, boolean>>;
  result: any | null;
}

const NumberControl = ({ 
  value, 
  onChange, 
  min = 0, 
  max = 10000000, 
  step = 1, 
  label,
  suffix,
  prefix
}: {
  value: string;
  onChange: (val: string) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  suffix?: string;
  prefix?: string;
}) => {
  const handleDec = () => {
    const num = parseFloat(value) || 0;
    if (num - step >= min) onChange(Math.round((num - step) * 100) / 100 + "");
  };

  const handleInc = () => {
    const num = parseFloat(value) || 0;
    if (num + step <= max) onChange(Math.round((num + step) * 100) / 100 + "");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, ''); 
    const val = raw.replace(/[^0-9.]/g, '');
    onChange(val);
  };

  const btnStyle = {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "white",
    color: COLORS.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
  };

  return (
    <div style={{
      backgroundColor: COLORS.inputBg,
      borderRadius: "12px",
      padding: "6px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "8px",
      height: "44px"
    }}>
      <button onClick={handleDec} style={btnStyle}><Minus size={16} strokeWidth={3} /></button>
      
      <div style={{flex: 1, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px"}}>
          {prefix && <span style={{fontSize: "16px", fontWeight: 700, color: COLORS.textMain}}>{prefix}</span>}
          <input 
            type="text" 
            value={value ? Number(value).toLocaleString() : ""} 
            onChange={handleChange}
            style={{
              width: "100%", 
              border: "none", 
              background: "transparent", 
              textAlign: "center", 
              fontSize: "16px", 
              fontWeight: 700, 
              color: COLORS.textMain,
              outline: "none"
            }}
          />
          {suffix && <span style={{fontSize: "14px", color: COLORS.textSecondary, fontWeight: 500}}>{suffix}</span>}
      </div>

      <button onClick={handleInc} style={btnStyle}><Plus size={16} strokeWidth={3} /></button>
    </div>
  );
};

const DEFAULT_VALUES: CalculatorValues = {
  currentAge: "35",
  income: "60000",
  savings: "30000",
  contributions: "500",
  budget: "2561",
  otherIncome: "0",
  retirementAge: "67",
  lifeExpectancy: "95",
  preRetireRate: "6",
  postRetireRate: "5",
  inflation: "3",
  incomeIncrease: "2",
  contributionMode: "$",
  budgetMode: "$"
};

const CALCULATOR_TYPES = ["Retirement Calculator"] as const;
type CalculatorType = typeof CALCULATOR_TYPES[number];

const STORAGE_KEY = "RETIREMENT_CALCULATOR_DATA";
const EXPIRATION_DAYS = 30;

const loadSavedData = (): Record<CalculatorType, CalculatorData> => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const { data, timestamp } = JSON.parse(saved);
      const now = new Date().getTime();
      const daysDiff = (now - timestamp) / (1000 * 60 * 60 * 24);
      
      if (daysDiff < EXPIRATION_DAYS) {
        const merged: Record<CalculatorType, CalculatorData> = {
            "Retirement Calculator": { values: { ...DEFAULT_VALUES }, touched: {}, result: null }
        };

        if (data["Retirement Calculator"]) {
            merged["Retirement Calculator"] = {
                ...merged["Retirement Calculator"],
                ...data["Retirement Calculator"],
                values: { ...merged["Retirement Calculator"].values, ...data["Retirement Calculator"].values }
            };
        }
        return merged;
      }
    }
  } catch (e) {
    console.error("Failed to load saved data", e);
  }
  
  return {
    "Retirement Calculator": { values: { ...DEFAULT_VALUES }, touched: {}, result: null }
  };
};

export default function RetirementCalculatorHelloWorld({ initialData }: { initialData?: any }) {
  const [calculatorType, setCalculatorType] = useState<CalculatorType>("Retirement Calculator");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [calculators, setCalculators] = useState<Record<CalculatorType, CalculatorData>>(() => {
    const loaded = loadSavedData();
    if (initialData && (initialData.current_age || initialData.annual_pre_tax_income)) {
       try {
         const current = loaded["Retirement Calculator"];
         loaded["Retirement Calculator"] = {
           ...current,
           values: {
             ...current.values,
             currentAge: initialData.current_age ? String(initialData.current_age) : current.values.currentAge,
             income: initialData.annual_pre_tax_income ? String(initialData.annual_pre_tax_income) : current.values.income,
             savings: initialData.current_retirement_savings ? String(initialData.current_retirement_savings) : current.values.savings,
             contributions: initialData.monthly_contributions ? String(initialData.monthly_contributions) : current.values.contributions,
             budget: initialData.monthly_budget_in_retirement ? String(initialData.monthly_budget_in_retirement) : current.values.budget,
             otherIncome: initialData.other_retirement_income ? String(initialData.other_retirement_income) : current.values.otherIncome,
             retirementAge: initialData.retirement_age ? String(initialData.retirement_age) : current.values.retirementAge,
             lifeExpectancy: initialData.life_expectancy ? String(initialData.life_expectancy) : current.values.lifeExpectancy,
             preRetireRate: initialData.pre_retirement_rate_of_return ? String(initialData.pre_retirement_rate_of_return) : current.values.preRetireRate,
             postRetireRate: initialData.post_retirement_rate_of_return ? String(initialData.post_retirement_rate_of_return) : current.values.postRetireRate,
             inflation: initialData.inflation_rate ? String(initialData.inflation_rate) : current.values.inflation,
             incomeIncrease: initialData.annual_income_increase ? String(initialData.annual_income_increase) : current.values.incomeIncrease
           },
           touched: {} // Reset touched on fresh load
         };
       } catch (e) {
         console.error("Failed to apply initialData:", e);
       }
    }
    return loaded;
  });

  // Subscription State
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [subscribeMessage, setSubscribeMessage] = useState("");

  // Feedback State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  useEffect(() => {
    if (showSubscribeModal && (window as any).turnstile) {
      setTimeout(() => {
          try {
            (window as any).turnstile.render('#turnstile-widget', {
              sitekey: (window as any).TURNSTILE_SITE_KEY,
              callback: function(token: string) {
                setTurnstileToken(token);
              },
            });
          } catch (e) {
            // Turnstile might already be rendered
          }
      }, 100);
    }
  }, [showSubscribeModal]);

  const handleSubscribe = async () => {
    if (!email || !email.includes("@")) {
        setSubscribeMessage("Please enter a valid email.");
        setSubscribeStatus("error");
        return;
    }
    if (!turnstileToken) {
        setSubscribeMessage("Please complete the security check.");
        setSubscribeStatus("error");
        return;
    }

    setSubscribeStatus("loading");
    try {
        const response = await fetch("/api/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email,
                settlementId: "retirement-news",
                settlementName: "Retirement Calculator News",
                turnstileToken
            })
        });
        
        const data = await response.json();
        if (response.ok && data.success) {
            setSubscribeStatus("success");
            setSubscribeMessage(data.message);
            setTimeout(() => {
                setShowSubscribeModal(false);
                setEmail("");
                setSubscribeStatus("idle");
                setSubscribeMessage("");
                setTurnstileToken(null);
            }, 3000);
        } else {
            setSubscribeStatus("error");
            setSubscribeMessage(data.error || "Failed to subscribe.");
        }
    } catch (e) {
        setSubscribeStatus("error");
        setSubscribeMessage("Network error. Please try again.");
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) return;

    setFeedbackStatus("submitting");
    try {
        const response = await fetch("/api/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                event: "user_feedback",
                data: {
                    feedback: feedbackText,
                    calculatorType
                }
            })
        });

        if (response.ok) {
            setFeedbackStatus("success");
            setTimeout(() => {
                setShowFeedbackModal(false);
                setFeedbackText("");
                setFeedbackStatus("idle");
            }, 2000);
        } else {
            setFeedbackStatus("error");
        }
    } catch (e) {
        setFeedbackStatus("error");
    }
  };

  useEffect(() => {
    const dataToSave = {
        data: calculators,
        timestamp: new Date().getTime()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [calculators]);

  const currentCalc = calculators[calculatorType];
  const { 
    currentAge, income, savings, contributions, budget, otherIncome,
    retirementAge, lifeExpectancy, preRetireRate, postRetireRate, inflation, incomeIncrease,
    contributionMode, budgetMode
  } = currentCalc.values;

  const updateVal = (field: keyof CalculatorValues, value: any) => {
    setCalculators(prev => {
      const next = { ...prev };
      next[calculatorType] = {
        ...next[calculatorType],
        values: {
          ...next[calculatorType].values,
          [field]: value
        },
        touched: {
          ...next[calculatorType].touched,
          [field]: true
        }
      };
      return next;
    });
  };

  const updateResult = (result: any) => {
    setCalculators(prev => ({
      ...prev,
      [calculatorType]: {
        ...prev[calculatorType],
        result
      }
    }));
  };

  const calculateRetirement = () => {
    const currentAgeNum = parseFloat(currentAge);
    const retirementAgeNum = parseFloat(retirementAge);
    const lifeExpectancyNum = parseFloat(lifeExpectancy);
    const incomeNum = parseFloat(income);
    let savingsNum = parseFloat(savings);
    
    if (isNaN(currentAgeNum) || isNaN(retirementAgeNum) || isNaN(incomeNum) || isNaN(savingsNum)) {
      return;
    }

    // Advanced Calculation Logic
    const preRate = parseFloat(preRetireRate) / 100;
    const postRate = parseFloat(postRetireRate) / 100;
    const infl = parseFloat(inflation) / 100;
    const incIncrease = parseFloat(incomeIncrease) / 100;
    
    // 1. Calculate "What you'll need" at Retirement Age
    const yearsPre = retirementAgeNum - currentAgeNum;
    const yearsPost = lifeExpectancyNum - retirementAgeNum;
    
    // Monthly shortfall in today's dollars
    const monthlyShortfallToday = Math.max(0, parseFloat(budget) - parseFloat(otherIncome));
    const annualShortfallToday = monthlyShortfallToday * 12;
    
    // Annual shortfall at retirement (inflated)
    const annualShortfallAtRetire = annualShortfallToday * Math.pow(1 + infl, yearsPre);
    
    // Need: Balance that can sustain inflated withdrawals until death
    let neededAtRetirement = 0;
    // Backwards simulation for NEED
    let balance = 0;
    for (let i = 0; i < yearsPost; i++) {
        const payout = annualShortfallAtRetire * Math.pow(1 + infl, yearsPost - 1 - i);
        balance = (balance + payout) / (1 + postRate);
    }
    neededAtRetirement = balance;

    // 2. Required Contribution Calculation
    const fvSavings = savingsNum * Math.pow(1 + preRate, yearsPre);
    const gap = neededAtRetirement - fvSavings;
    
    let initialAnnualContribNeeded = 0;
    let accumFactor = 0;
    for (let k = 0; k < yearsPre; k++) {
        accumFactor += Math.pow(1 + incIncrease, k) * Math.pow(1 + preRate, yearsPre - 1 - k);
    }
    if (accumFactor > 0) {
        initialAnnualContribNeeded = gap / accumFactor;
    }
    
    // 3. Generate Graph Data
    const graphData = [];
    
    let simCurrent = savingsNum;
    let simIdeal = savingsNum;
    
    let simSalary = incomeNum;
    let simCurrentContrib = parseFloat(contributions);
    if (contributionMode === "%") simCurrentContrib = (simSalary / 12) * (simCurrentContrib / 100);
    simCurrentContrib *= 12; // Annual
    
    let simIdealContrib = Math.max(0, initialAnnualContribNeeded);
    
    let runOutAgeCurrent = null;
    let runOutAgeIdeal = null;
    
    const totalYears = lifeExpectancyNum - currentAgeNum;
    
    for (let yr = 0; yr <= totalYears; yr++) {
        const age = currentAgeNum + yr;
        const isRetired = age >= retirementAgeNum;
        
        graphData.push({
            age,
            current: Math.round(simCurrent),
            recommended: Math.round(simIdeal)
        });
        
        if (isRetired) {
            // Drawdown phase
            const payout = annualShortfallAtRetire * Math.pow(1 + infl, age - retirementAgeNum);
            
            // Current Path
            if (simCurrent > 0) {
                simCurrent = simCurrent * (1 + postRate) - payout;
                if (simCurrent < 0) {
                    simCurrent = 0;
                    runOutAgeCurrent = age;
                }
            }
            
            // Ideal Path
            if (simIdeal > 0) {
                simIdeal = simIdeal * (1 + postRate) - payout;
                if (simIdeal < 0) {
                    simIdeal = 0;
                    runOutAgeIdeal = age;
                }
            }
            
        } else {
            // Accumulation phase
            simCurrent = simCurrent * (1 + preRate) + simCurrentContrib;
            simIdeal = simIdeal * (1 + preRate) + simIdealContrib;
            
            simSalary *= (1 + incIncrease);
            
            if (contributionMode === "%") {
                simCurrentContrib = (simSalary) * (parseFloat(contributions) / 100);
            }
            simIdealContrib *= (1 + incIncrease);
        }
    }

    const whatYouHave = graphData.find(d => d.age === retirementAgeNum)?.current || 0;
    const whatYouNeed = neededAtRetirement;

    updateResult({
        have: Math.round(whatYouHave),
        need: Math.round(whatYouNeed),
        graphData,
        runOutAgeCurrent: runOutAgeCurrent || lifeExpectancyNum,
        runOutAgeIdeal: runOutAgeIdeal || lifeExpectancyNum,
        monthlyContribNeeded: Math.round(initialAnnualContribNeeded / 12),
        currentMonthlyContrib: Math.round(simCurrentContrib / 12)
    });
  };

  const calculate = () => {
      calculateRetirement();
  };

  useEffect(() => {
    calculate();
  }, [currentCalc.values]);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [resultView, setResultView] = useState<"graph" | "summary">("graph");

  const toggleMode = (field: "contributionMode" | "budgetMode") => {
    const current = currentCalc.values[field];
    updateVal(field, current === "$" ? "%" : "$");
  };

  // Smart Defaults: Auto-calculate budget based on income if budget hasn't been touched
  useEffect(() => {
    const incomeNum = parseFloat(income);
    if (!isNaN(incomeNum) && !currentCalc.touched.budget) {
      // 75% replacement rate rule of thumb
      const suggestedAnnualBudget = incomeNum * 0.75;
      const suggestedMonthlyBudget = Math.round(suggestedAnnualBudget / 12);
      
      setCalculators(prev => {
        const next = { ...prev };
        next[calculatorType] = {
          ...next[calculatorType],
          values: {
            ...next[calculatorType].values,
            budget: String(suggestedMonthlyBudget)
          }
          // Do NOT mark as touched so it continues to update until user manually overrides
        };
        return next;
      });
    }
  }, [income, currentCalc.touched.budget, calculatorType]);

  const handleInvestmentStrategy = (strategy: "conservative" | "moderate" | "aggressive") => {
    let pre = "6";
    let post = "5";
    
    if (strategy === "conservative") {
        pre = "4";
        post = "3";
    } else if (strategy === "aggressive") {
        pre = "9";
        post = "7";
    } else {
        // Moderate
        pre = "7";
        post = "5";
    }

    setCalculators(prev => {
        const next = { ...prev };
        next[calculatorType] = {
          ...next[calculatorType],
          values: {
            ...next[calculatorType].values,
            preRetireRate: pre,
            postRetireRate: post
          },
          touched: {
            ...next[calculatorType].touched,
            preRetireRate: true,
            postRetireRate: true
          }
        };
        return next;
      });
  };

  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({
    kids: 0,
    college: "no", // no, partial, full
    travel: "moderate", // low, moderate, high
  });

  const handleQuizComplete = () => {
    // 1. Adjust Monthly Contributions based on College
    // Assumption: College costs reduce ability to save for retirement now (if kids are young) 
    // or are a large expense. Let's assume it reduces monthly contributions availability.
    let currentContrib = parseFloat(contributions);
    if (quizAnswers.college === "full") {
        // Reduce savings by $500 per kid
        currentContrib = Math.max(0, currentContrib - (quizAnswers.kids * 500));
    } else if (quizAnswers.college === "partial") {
        // Reduce savings by $200 per kid
        currentContrib = Math.max(0, currentContrib - (quizAnswers.kids * 200));
    }
    updateVal("contributions", String(currentContrib));

    // 2. Adjust Retirement Budget based on Travel
    let baseBudget = parseFloat(budget);
    // Reset base if we want to purely calculate from scratch, but let's just adjust current
    // If user hasn't touched budget, it might be the auto-calculated one.
    
    let travelCost = 0;
    if (quizAnswers.travel === "low") travelCost = 200;
    else if (quizAnswers.travel === "moderate") travelCost = 800;
    else if (quizAnswers.travel === "high") travelCost = 2500;
    
    // If they have kids, maybe they visit them? +$200/mo
    if (quizAnswers.kids > 0) travelCost += 200;

    // We add this to the "Smart Estimate" baseline if budget wasn't manually set, 
    // OR we just add it to the current value. Let's add to current for simplicity.
    const newBudget = Math.round(baseBudget + travelCost);
    updateVal("budget", String(newBudget));

    setShowQuiz(false);
    setQuizStep(0);
  };

  // "Smart Estimate" for budget
  const applySmartBudget = () => {
      const incomeNum = parseFloat(income);
      if (!isNaN(incomeNum)) {
          // 75% replacement rate
          const suggested = Math.round((incomeNum * 0.75) / 12);
          updateVal("budget", String(suggested));
      }
  };

  const styles = {
    container: {
      width: "100%",
      maxWidth: "600px",
      margin: "0 auto",
      backgroundColor: COLORS.bg,
      fontFamily: "'Inter', sans-serif",
      padding: "20px",
      boxSizing: "border-box" as const
    },
    title: {
      fontSize: "28px",
      fontWeight: 800,
      color: COLORS.textMain,
      marginBottom: "10px",
      textAlign: "left" as const
    },
    subheader: {
      fontSize: "14px",
      color: COLORS.textSecondary,
      marginBottom: "20px",
      marginTop: "-5px"
    },
    card: {
      backgroundColor: COLORS.card,
      borderRadius: "24px",
      padding: "24px",
      boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)",
      marginBottom: "20px"
    },
    row: {
      display: "flex",
      alignItems: "flex-start",
      marginBottom: "20px",
      gap: "16px"
    },
    column: {
      flex: 1,
      display: "flex",
      flexDirection: "column" as const,
      gap: "8px"
    },
    label: {
      fontWeight: 600,
      color: COLORS.textMain,
      fontSize: "15px"
    },
    toggleContainer: {
      display: "flex",
      gap: "4px",
      backgroundColor: COLORS.inputBg,
      borderRadius: "8px",
      padding: "2px",
      alignItems: "center"
    },
    toggleBtn: (isActive: boolean) => ({
      padding: "4px 12px",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: "14px",
      color: isActive ? "white" : COLORS.textSecondary,
      backgroundColor: isActive ? COLORS.blue : "transparent",
      transition: "all 0.2s"
    }),
    buttonRow: {
      display: "flex",
      gap: "12px",
      marginTop: "10px"
    },
    calcButton: {
      flex: 1,
      backgroundColor: COLORS.primary,
      color: "white",
      border: "none",
      padding: "14px",
      borderRadius: "16px",
      fontSize: "16px",
      fontWeight: 700,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      boxShadow: "0 4px 12px rgba(86, 197, 150, 0.2)"
    },
    resultCard: {
      backgroundColor: COLORS.card,
      borderRadius: "24px",
      padding: "24px",
      boxShadow: "0 10px 40px -10px rgba(0,0,0,0.08)",
      marginTop: "24px"
    },
    resultHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
      borderBottom: `1px solid ${COLORS.border}`,
      paddingBottom: "16px"
    },
    resultTitle: {
        fontSize: "18px",
        fontWeight: 700,
        color: COLORS.textMain
    },
    list: {
      fontSize: "14px",
      lineHeight: "1.8",
      color: COLORS.textSecondary,
      backgroundColor: COLORS.inputBg,
      padding: "16px",
      borderRadius: "16px"
    },
    listItem: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "8px",
        borderBottom: "1px dashed #E5E7EB",
        paddingBottom: "8px"
    },
    footer: {
      display: "flex",
      justifyContent: "center",
      gap: "24px",
      marginTop: "40px",
      paddingTop: "24px",
      borderTop: `1px solid ${COLORS.border}`
    },
    footerBtn: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      background: "none",
      border: "none",
      cursor: "pointer",
      color: COLORS.textSecondary,
      fontSize: "14px",
      fontWeight: 600,
      transition: "color 0.2s",
      padding: "8px"
    },
    sectionTitle: {
      fontSize: "20px",
      fontWeight: 700,
      color: COLORS.textMain,
      marginBottom: "16px",
      paddingLeft: "4px"
    },
    modalOverlay: {
      position: "fixed" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px"
    },
    modalContent: {
      backgroundColor: "white",
      borderRadius: "24px",
      padding: "32px",
      width: "100%",
      maxWidth: "400px",
      boxShadow: "0 20px 60px -10px rgba(0,0,0,0.2)",
      position: "relative" as const
    },
    modalClose: {
      position: "absolute" as const,
      top: "20px",
      right: "20px",
      background: "none",
      border: "none",
      cursor: "pointer",
      color: COLORS.textSecondary,
      padding: "4px"
    },
    input: {
      width: "100%",
      padding: "12px 16px",
      borderRadius: "12px",
      border: `1px solid ${COLORS.border}`,
      fontSize: "16px",
      backgroundColor: COLORS.inputBg,
      color: COLORS.textMain,
      marginBottom: "16px",
      boxSizing: "border-box" as const,
      outline: "none"
    },
    headerRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "10px"
    },
    quizButton: {
        width: "100%",
        backgroundColor: COLORS.accentLight,
        color: COLORS.primaryDark,
        border: `1px solid ${COLORS.primary}`,
        padding: "12px",
        borderRadius: "12px",
        fontSize: "14px",
        fontWeight: 700,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        marginBottom: "24px",
        transition: "all 0.2s"
    },
    strategyBtn: (active: boolean) => ({
        flex: 1,
        padding: "8px",
        borderRadius: "8px",
        border: active ? `2px solid ${COLORS.primary}` : `1px solid ${COLORS.border}`,
        backgroundColor: active ? COLORS.accentLight : "white",
        color: active ? COLORS.primaryDark : COLORS.textSecondary,
        fontWeight: 700,
        fontSize: "12px",
        cursor: "pointer",
        textAlign: "center" as const
    }),
    subscribeBtn: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: "8px 12px",
      backgroundColor: COLORS.inputBg,
      color: COLORS.primary,
      borderRadius: "8px",
      border: "none",
      fontSize: "12px",
      fontWeight: 600,
      cursor: "pointer",
      textDecoration: "none",
      transition: "background-color 0.2s"
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div style={styles.title}>Retirement Calculator</div>
        <button style={styles.subscribeBtn} className="btn-press" onClick={() => setShowSubscribeModal(true)}>
          <Mail size={14} />
          Subscribe
        </button>
      </div>
      <div style={styles.subheader}>
        Plan your financial future.
      </div>

      <button style={styles.quizButton} onClick={() => setShowQuiz(true)}>
        <MessageSquare size={18} />
        Get More Accurate Results
      </button>

      <div style={styles.card}>
        <div style={styles.sectionTitle}>Retirement details</div>
        
        <div style={styles.row}>
            <div style={styles.column}>
                <div style={styles.label}>Current age</div>
                <NumberControl 
                    value={currentAge}
                    onChange={(v) => updateVal("currentAge", v)}
                    min={18} max={100} 
                />
            </div>

            <div style={styles.column}>
                <div style={styles.label}>Annual pre-tax income</div>
                <NumberControl 
                    value={income}
                    onChange={(v) => updateVal("income", v)}
                    min={0} max={10000000} step={1000}
                    prefix="$"
                />
            </div>
        </div>

        <div style={styles.row}>
            <div style={styles.column}>
                <div style={styles.label}>Current retirement savings</div>
                <NumberControl 
                    value={savings}
                    onChange={(v) => updateVal("savings", v)}
                    min={0} max={10000000} step={1000}
                    prefix="$"
                />
            </div>

            <div style={styles.column}>
                <div style={styles.label}>Other retirement income</div>
                <NumberControl 
                    value={otherIncome}
                    onChange={(v) => updateVal("otherIncome", v)}
                    min={0} max={100000} step={100}
                    prefix="$"
                />
            </div>
        </div>

        <div style={styles.row}>
            <div style={styles.column}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div style={styles.label}>Monthly contributions</div>
                    <div style={styles.toggleContainer}>
                        <div 
                            style={styles.toggleBtn(contributionMode === "$")}
                            onClick={() => updateVal("contributionMode", "$")}
                        >$</div>
                        <div 
                            style={styles.toggleBtn(contributionMode === "%")}
                            onClick={() => updateVal("contributionMode", "%")}
                        >%</div>
                    </div>
                </div>
                <NumberControl 
                    value={contributions}
                    onChange={(v) => updateVal("contributions", v)}
                    min={0} max={contributionMode === "$" ? 100000 : 100} step={contributionMode === "$" ? 100 : 1}
                    prefix={contributionMode === "$" ? "$" : undefined}
                    suffix={contributionMode === "%" ? "%" : undefined}
                />
            </div>

            <div style={styles.column}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div style={styles.label}>Monthly budget in retirement</div>
                    <div style={styles.toggleContainer}>
                        <div 
                            style={styles.toggleBtn(budgetMode === "$")}
                            onClick={() => updateVal("budgetMode", "$")}
                        >$</div>
                        <div 
                            style={styles.toggleBtn(budgetMode === "%")}
                            onClick={() => updateVal("budgetMode", "%")}
                        >%</div>
                    </div>
                </div>
                <NumberControl 
                    value={budget}
                    onChange={(v) => updateVal("budget", v)}
                    min={0} max={budgetMode === "$" ? 100000 : 200} step={budgetMode === "$" ? 100 : 1}
                    prefix={budgetMode === "$" ? "$" : undefined}
                    suffix={budgetMode === "%" ? "%" : undefined}
                />
                <div 
                    style={{fontSize: 12, color: COLORS.primary, fontWeight: 700, cursor: 'pointer', display: 'flex', justifyContent: 'flex-end', marginTop: 4}}
                    onClick={applySmartBudget}
                >
                    <span>🪄 Estimate</span>
                </div>
            </div>
        </div>

        <div 
            style={{display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: 20, marginBottom: 20, color: COLORS.blue, fontWeight: 700, fontSize: 14}}
            onClick={() => setShowAdvanced(!showAdvanced)}
        >
            {showAdvanced ? "HIDE ADVANCED DETAILS" : "ADVANCED DETAILS"}
            <ChevronDown size={16} style={{transform: showAdvanced ? "rotate(180deg)" : "none", transition: "transform 0.2s"}} />
        </div>

        {showAdvanced && (
            <>
                <div style={{marginBottom: 16}}>
                    <div style={{fontSize: 14, fontWeight: 600, color: COLORS.textMain, marginBottom: 8}}>Investment Strategy</div>
                    <div style={{display: "flex", gap: 8}}>
                        <div style={styles.strategyBtn(preRetireRate === "4" && postRetireRate === "3")} onClick={() => handleInvestmentStrategy("conservative")}>
                            <div>Conservative</div>
                            <div style={{fontSize: 10, fontWeight: 400, marginTop: 2}}>Bonds & Stability</div>
                        </div>
                        <div style={styles.strategyBtn(preRetireRate === "7" && postRetireRate === "5")} onClick={() => handleInvestmentStrategy("moderate")}>
                            <div>Moderate</div>
                            <div style={{fontSize: 10, fontWeight: 400, marginTop: 2}}>Balanced Growth</div>
                        </div>
                        <div style={styles.strategyBtn(preRetireRate === "9" && postRetireRate === "7")} onClick={() => handleInvestmentStrategy("aggressive")}>
                            <div>Aggressive</div>
                            <div style={{fontSize: 10, fontWeight: 400, marginTop: 2}}>Max Returns</div>
                        </div>
                    </div>
                </div>

                <div style={styles.row}>
                    <div style={styles.column}>
                        <div style={styles.label}>Retirement age</div>
                        <NumberControl 
                            value={retirementAge}
                            onChange={(v) => updateVal("retirementAge", v)}
                            min={parseInt(currentAge) + 1} max={100} 
                        />
                    </div>

                    <div style={styles.column}>
                        <div style={styles.label}>Life expectancy</div>
                        <NumberControl 
                            value={lifeExpectancy}
                            onChange={(v) => updateVal("lifeExpectancy", v)}
                            min={parseInt(retirementAge) + 1} max={120} 
                        />
                    </div>
                </div>

                <div style={styles.row}>
                    <div style={styles.column}>
                        <div style={styles.label}>Pre-retirement rate of return</div>
                        <NumberControl 
                            value={preRetireRate}
                            onChange={(v) => updateVal("preRetireRate", v)}
                            min={0} max={15} suffix="%"
                        />
                    </div>

                    <div style={styles.column}>
                        <div style={styles.label}>Post-retirement rate of return</div>
                        <NumberControl 
                            value={postRetireRate}
                            onChange={(v) => updateVal("postRetireRate", v)}
                            min={0} max={15} suffix="%"
                        />
                    </div>
                </div>

                <div style={styles.row}>
                    <div style={styles.column}>
                        <div style={styles.label}>Inflation rate</div>
                        <NumberControl 
                            value={inflation}
                            onChange={(v) => updateVal("inflation", v)}
                            min={0} max={10} suffix="%"
                        />
                    </div>

                    <div style={styles.column}>
                        <div style={styles.label}>Annual income increase</div>
                        <NumberControl 
                            value={incomeIncrease}
                            onChange={(v) => updateVal("incomeIncrease", v)}
                            min={0} max={10} suffix="%"
                        />
                    </div>
                </div>
            </>
        )}

        <div style={styles.buttonRow}>
            <button className="btn-press" style={styles.calcButton} onClick={calculate} disabled={isAnalyzing}>
              {isAnalyzing ? <Loader size={20} className="spin" /> : <>Calculate <Play size={20} fill="white" /></>}
            </button>
        </div>
      </div>

      {currentCalc.result && (
        <div style={styles.resultCard}>
            <div style={styles.resultHeader}>
                <span style={styles.resultTitle}>Retirement savings at age {currentCalc.values.retirementAge}</span>
            </div>
            
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 24, gap: 16}}>
                <div style={{flex: 1}}>
                    <div style={{fontSize: 14, color: COLORS.textMain, marginBottom: 4}}>What you'll have</div>
                    <div style={{fontSize: 28, fontWeight: 800, color: COLORS.textMain}}>${currentCalc.result.have.toLocaleString()}</div>
                </div>
                <div style={{flex: 1, borderLeft: `1px solid ${COLORS.border}`, paddingLeft: 16}}>
                    <div style={{fontSize: 14, color: COLORS.textMain, marginBottom: 4}}>What you'll need</div>
                    <div style={{fontSize: 28, fontWeight: 800, color: COLORS.textMain}}>${currentCalc.result.need.toLocaleString()}</div>
                </div>
            </div>

            <div style={{marginBottom: 16}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: COLORS.blue, fontSize: 12, fontWeight: 600}}>
                    <HelpCircle size={14} />
                    How did we calculate your results?
                </div>
            </div>

            {/* Tabs */}
            <div style={{display: 'flex', borderBottom: `1px solid ${COLORS.border}`, marginBottom: 24}}>
                <div 
                    style={{padding: '8px 16px', borderBottom: resultView === 'graph' ? `2px solid ${COLORS.primary}` : 'none', fontWeight: 700, color: resultView === 'graph' ? COLORS.primary : COLORS.textSecondary, cursor: 'pointer', fontSize: 12, letterSpacing: 1}}
                    onClick={() => setResultView('graph')}
                >GRAPH VIEW</div>
                <div 
                    style={{padding: '8px 16px', borderBottom: resultView === 'summary' ? `2px solid ${COLORS.primary}` : 'none', fontWeight: 700, color: resultView === 'summary' ? COLORS.primary : COLORS.textSecondary, cursor: 'pointer', fontSize: 12, letterSpacing: 1}}
                    onClick={() => setResultView('summary')}
                >SUMMARY VIEW</div>
            </div>

            {resultView === 'graph' ? (
                <div style={{height: 300, width: '100%', fontSize: 12}}>
                    <ResponsiveContainer>
                        <AreaChart data={currentCalc.result.graphData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                            <defs>
                                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.border} />
                            <XAxis dataKey="age" tick={{fill: COLORS.textSecondary}} tickLine={false} axisLine={{stroke: COLORS.border}} minTickGap={30} />
                            <YAxis tick={{fill: COLORS.textSecondary}} tickFormatter={(val) => `$${(val/1000000).toFixed(1)}m`} tickLine={false} axisLine={false} />
                            <Tooltip 
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        const rec = payload.find(p => p.name === 'Recommended')?.value as number;
                                        const cur = payload.find(p => p.name === 'Current path')?.value as number;
                                        const diff = (cur !== undefined && rec !== undefined) ? cur - rec : 0;
                                        return (
                                            <div style={{backgroundColor: 'white', padding: 12, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #E5E7EB'}}>
                                                <div style={{fontWeight: 600, marginBottom: 8, fontSize: 12, color: COLORS.textSecondary}}>Age {label}</div>
                                                <div style={{display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 4}}>
                                                    <span style={{color: COLORS.blue, fontWeight: 600, fontSize: 12}}>Recommended</span>
                                                    <span style={{fontWeight: 700, color: COLORS.textMain, fontSize: 12}}>${rec?.toLocaleString()}</span>
                                                </div>
                                                <div style={{display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 8}}>
                                                    <span style={{color: COLORS.primary, fontWeight: 600, fontSize: 12}}>Current path</span>
                                                    <span style={{fontWeight: 700, color: COLORS.textMain, fontSize: 12}}>${cur?.toLocaleString()}</span>
                                                </div>
                                                <div style={{display: 'flex', justifyContent: 'space-between', gap: 16, borderTop: '1px dashed #E5E7EB', paddingTop: 4}}>
                                                    <span style={{color: COLORS.textSecondary, fontSize: 12}}>Difference</span>
                                                    <span style={{fontWeight: 700, color: diff >= 0 ? COLORS.primary : COLORS.red, fontSize: 12}}>{diff >= 0 ? '+' : ''}${diff.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area type="monotone" dataKey="recommended" stroke={COLORS.blue} strokeDasharray="5 5" fill="transparent" strokeWidth={2} name="Recommended" />
                            <Area type="monotone" dataKey="current" stroke={COLORS.primary} fill="url(#colorCurrent)" strokeWidth={2} name="Current path" />
                            <ReferenceDot x={parseInt(currentCalc.values.retirementAge)} y={currentCalc.result.have} r={4} fill={COLORS.primary} stroke="white" strokeWidth={2} />
                            <ReferenceDot x={parseInt(currentCalc.values.retirementAge)} y={currentCalc.result.need} r={4} fill={COLORS.blue} stroke="white" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                    <div style={{display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
                            <div style={{width: 12, height: 2, backgroundColor: COLORS.blue}}></div>
                            <span style={{color: COLORS.textSecondary, fontSize: 12}}>Recommended</span>
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
                            <div style={{width: 12, height: 2, backgroundColor: COLORS.primary}}></div>
                            <span style={{color: COLORS.textSecondary, fontSize: 12}}>Current path</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={styles.list}>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16}}>
                        <div style={{fontWeight: 700, color: COLORS.textSecondary, fontSize: 12}}>Current retirement plan</div>
                        <div style={{fontWeight: 700, color: COLORS.textSecondary, fontSize: 12}}>Target retirement plan</div>
                    </div>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
                        {/* Current Column */}
                        <div>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8, borderBottom: '1px dashed #E5E7EB', paddingBottom: 8}}>
                                <span style={{fontSize: 14, color: COLORS.textSecondary}}>Total retirement savings</span>
                                <span style={{fontWeight: 700, color: COLORS.primary, fontSize: 14}}>${currentCalc.result.have.toLocaleString()}</span>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8, borderBottom: '1px dashed #E5E7EB', paddingBottom: 8}}>
                                <span style={{fontSize: 14, color: COLORS.textSecondary}}>Monthly contribution</span>
                                <span style={{fontWeight: 700, color: COLORS.primary, fontSize: 14}}>${currentCalc.result.currentMonthlyContrib.toLocaleString()}</span>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8, borderBottom: '1px dashed #E5E7EB', paddingBottom: 8}}>
                                <span style={{fontSize: 14, color: COLORS.textSecondary}}>Age savings runs out</span>
                                <span style={{fontWeight: 700, color: currentCalc.result.runOutAgeCurrent < parseInt(currentCalc.values.lifeExpectancy) ? COLORS.red : COLORS.primary, fontSize: 14}}>
                                    {currentCalc.result.runOutAgeCurrent >= parseInt(currentCalc.values.lifeExpectancy) ? `${currentCalc.result.runOutAgeCurrent}+` : currentCalc.result.runOutAgeCurrent}
                                </span>
                            </div>
                        </div>
                        {/* Target Column */}
                        <div>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8, borderBottom: '1px dashed #E5E7EB', paddingBottom: 8}}>
                                <span style={{fontSize: 14, color: COLORS.textSecondary}}>Total retirement savings</span>
                                <span style={{fontWeight: 700, color: COLORS.primary, fontSize: 14}}>${currentCalc.result.need.toLocaleString()}</span>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8, borderBottom: '1px dashed #E5E7EB', paddingBottom: 8}}>
                                <span style={{fontSize: 14, color: COLORS.textSecondary}}>Monthly contribution</span>
                                <span style={{fontWeight: 700, color: COLORS.primary, fontSize: 14}}>${currentCalc.result.monthlyContribNeeded.toLocaleString()}</span>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8, borderBottom: '1px dashed #E5E7EB', paddingBottom: 8}}>
                                <span style={{fontSize: 14, color: COLORS.textSecondary}}>Age savings runs out</span>
                                <span style={{fontWeight: 700, color: currentCalc.result.runOutAgeIdeal >= parseInt(currentCalc.values.lifeExpectancy) ? COLORS.primary : COLORS.red, fontSize: 14}}>
                                    {currentCalc.result.runOutAgeIdeal >= parseInt(currentCalc.values.lifeExpectancy) ? `${currentCalc.result.runOutAgeIdeal}+` : currentCalc.result.runOutAgeIdeal}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      )}
      
      <div style={styles.footer} className="no-print">
        <button style={styles.footerBtn} className="btn-press">
          <Heart size={16} /> Donate
        </button>
        <button style={styles.footerBtn} onClick={() => setShowFeedbackModal(true)} className="btn-press">
          <MessageSquare size={16} /> Feedback
        </button>
        <button style={styles.footerBtn} onClick={() => window.print()} className="btn-press">
          <Printer size={16} /> Print
        </button>
      </div>

      {showFeedbackModal && (
        <div style={styles.modalOverlay} onClick={() => setShowFeedbackModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={() => setShowFeedbackModal(false)}>
              <Minus size={24} style={{transform: "rotate(45deg)"}} />
            </button>
            
            <div style={{fontSize: "24px", fontWeight: 800, marginBottom: "8px", color: COLORS.textMain}}>
              Feedback
            </div>
            <div style={{fontSize: "14px", color: COLORS.textSecondary, marginBottom: "24px"}}>
              Help us improve the calculator.
            </div>

            {feedbackStatus === "success" ? (
                <div style={{textAlign: "center", padding: "20px", color: COLORS.primary, fontWeight: 600}}>
                    Thanks for your feedback!
                </div>
            ) : (
                <>
                    <textarea 
                        style={{...styles.input, height: "120px", resize: "none", fontFamily: "inherit"}}
                        placeholder="Tell us what you think..."
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                    />
                    {feedbackStatus === "error" && (
                        <div style={{color: COLORS.red, fontSize: "14px", marginBottom: "10px"}}>
                            Failed to send. Please try again.
                        </div>
                    )}
                    <button 
                        style={{...styles.calcButton, width: "100%"}} 
                        onClick={handleFeedbackSubmit}
                        disabled={feedbackStatus === "submitting" || !feedbackText.trim()}
                        className="btn-press"
                    >
                        {feedbackStatus === "submitting" ? "Sending..." : "Send Feedback"}
                    </button>
                </>
            )}
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {showQuiz && (
        <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
                <button style={styles.modalClose} onClick={() => setShowQuiz(false)}>✕</button>
                
                <div style={{marginBottom: 24, textAlign: "center"}}>
                    <div style={{fontSize: 20, fontWeight: 800, color: COLORS.textMain, marginBottom: 8}}>Personalize Your Plan</div>
                    <div style={{fontSize: 14, color: COLORS.textSecondary}}>Answer a few questions to refine your retirement inputs.</div>
                </div>

                {quizStep === 0 && (
                    <div>
                        <div style={{fontSize: 16, fontWeight: 600, color: COLORS.textMain, marginBottom: 16}}>1. Do you plan to have a family?</div>
                        <div style={{marginBottom: 16}}>
                            <div style={styles.label}>How many children?</div>
                            <NumberControl 
                                value={String(quizAnswers.kids)}
                                onChange={(v) => setQuizAnswers({...quizAnswers, kids: parseInt(v)})}
                                min={0} max={10}
                            />
                        </div>
                        <div style={{marginTop: 24, display: "flex", justifyContent: "flex-end"}}>
                            <button style={styles.subscribeBtn} onClick={() => setQuizStep(1)}>Next →</button>
                        </div>
                    </div>
                )}

                {quizStep === 1 && (
                    <div>
                        <div style={{fontSize: 16, fontWeight: 600, color: COLORS.textMain, marginBottom: 16}}>2. College Plans</div>
                        <div style={{fontSize: 14, color: COLORS.textSecondary, marginBottom: 16}}>
                            Do you plan to pay for your children's college education?
                        </div>
                        <div style={{display: "flex", flexDirection: "column", gap: 12}}>
                            <button 
                                style={styles.strategyBtn(quizAnswers.college === "no")} 
                                onClick={() => setQuizAnswers({...quizAnswers, college: "no"})}
                            >
                                No / They will take loans
                            </button>
                            <button 
                                style={styles.strategyBtn(quizAnswers.college === "partial")} 
                                onClick={() => setQuizAnswers({...quizAnswers, college: "partial"})}
                            >
                                Partial Support
                            </button>
                            <button 
                                style={styles.strategyBtn(quizAnswers.college === "full")} 
                                onClick={() => setQuizAnswers({...quizAnswers, college: "full"})}
                            >
                                Full Support
                            </button>
                        </div>
                        <div style={{marginTop: 24, display: "flex", justifyContent: "space-between"}}>
                            <button style={{...styles.subscribeBtn, background: 'transparent', color: COLORS.textSecondary}} onClick={() => setQuizStep(0)}>← Back</button>
                            <button style={styles.subscribeBtn} onClick={() => setQuizStep(2)}>Next →</button>
                        </div>
                    </div>
                )}

                {quizStep === 2 && (
                    <div>
                        <div style={{fontSize: 16, fontWeight: 600, color: COLORS.textMain, marginBottom: 16}}>3. Retirement Lifestyle</div>
                        <div style={{fontSize: 14, color: COLORS.textSecondary, marginBottom: 16}}>
                            How do you envision your travel plans?
                        </div>
                        <div style={{display: "flex", flexDirection: "column", gap: 12}}>
                            <button 
                                style={styles.strategyBtn(quizAnswers.travel === "low")} 
                                onClick={() => setQuizAnswers({...quizAnswers, travel: "low"})}
                            >
                                <div>Start Local</div>
                                <div style={{fontSize: 12, fontWeight: 400, opacity: 0.8}}>Low cost, mostly local trips</div>
                            </button>
                            <button 
                                style={styles.strategyBtn(quizAnswers.travel === "moderate")} 
                                onClick={() => setQuizAnswers({...quizAnswers, travel: "moderate"})}
                            >
                                <div>Explorer</div>
                                <div style={{fontSize: 12, fontWeight: 400, opacity: 0.8}}>1-2 major trips per year</div>
                            </button>
                            <button 
                                style={styles.strategyBtn(quizAnswers.travel === "high")} 
                                onClick={() => setQuizAnswers({...quizAnswers, travel: "high"})}
                            >
                                <div>Globetrotter</div>
                                <div style={{fontSize: 12, fontWeight: 400, opacity: 0.8}}>Frequent international travel</div>
                            </button>
                        </div>
                        <div style={{marginTop: 24, display: "flex", justifyContent: "space-between"}}>
                            <button style={{...styles.subscribeBtn, background: 'transparent', color: COLORS.textSecondary}} onClick={() => setQuizStep(1)}>← Back</button>
                            <button style={styles.subscribeBtn} onClick={handleQuizComplete}>Apply to Calculator</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* Subscription Modal */}
      {showSubscribeModal && (
        <div style={styles.modalOverlay} onClick={() => setShowSubscribeModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={() => setShowSubscribeModal(false)}>
              <Minus size={24} style={{transform: "rotate(45deg)"}} />
            </button>
            
            <div style={{fontSize: "24px", fontWeight: 800, marginBottom: "8px", color: COLORS.textMain}}>
              Stay Updated
            </div>
            <div style={{fontSize: "14px", color: COLORS.textSecondary, marginBottom: "24px"}}>
              Get the latest updates delivered to your inbox.
            </div>

            {subscribeStatus === "success" ? (
                <div style={{textAlign: "center", padding: "20px", color: COLORS.primary, fontWeight: 600}}>
                    <div style={{fontSize: "40px", marginBottom: "10px"}}>🎉</div>
                    {subscribeMessage}
                </div>
            ) : (
                <>
                    <div style={{marginBottom: "16px"}}>
                        <label style={{display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: COLORS.textMain}}>Email Address</label>
                        <input 
                            style={styles.input}
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div style={{marginBottom: "20px", minHeight: "120px", display: "flex", justifyContent: "center"}}>
                        <div id="turnstile-widget"></div>
                    </div>

                    {subscribeStatus === "error" && (
                        <div style={{color: COLORS.red, fontSize: "14px", marginBottom: "16px", textAlign: "center"}}>
                            {subscribeMessage}
                        </div>
                    )}

                    <button 
                        style={{...styles.calcButton, width: "100%"}} 
                        onClick={handleSubscribe}
                        disabled={subscribeStatus === "loading"}
                        className="btn-press"
                    >
                        {subscribeStatus === "loading" ? "Subscribing..." : "Subscribe"}
                    </button>
                </>
            )}
          </div>
        </div>
      )}

      <style>{`
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
            -webkit-appearance: none; 
            margin: 0; 
        }
        .btn-press {
          transition: transform 0.1s ease, opacity 0.2s;
        }
        .btn-press:active {
          transform: scale(0.95);
        }
        .btn-press:hover {
          opacity: 0.7;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .spin {
            animation: spin 1s linear infinite;
        }
        @media print {
          body {
            background-color: white;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
