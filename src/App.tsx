import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [number, setNumber] = useState<string>('')
  const [swaps, setSwaps] = useState<number>(0)
  const [result, setResult] = useState<string>('')
  const [isCalculating, setIsCalculating] = useState<boolean>(false)
  const [steps, setSteps] = useState<string[]>([])
  const [showExplanation, setShowExplanation] = useState<boolean>(false)
  const [highlight, setHighlight] = useState<{from: number, to: number} | null>(null)
  const [animationSteps, setAnimationSteps] = useState<Array<{digits: string[], from?: number, to?: number, desc: string, type: 'highlight' | 'swap' | 'noop' | 'try' | 'end' | 'backtrack', highlight?: number[], path?: string[]}>>([]);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [approach, setApproach] = useState<'greedy' | 'backtracking'>('greedy');
  const resultRef = useRef<HTMLDivElement>(null)

  const [showAlgoDetails, setShowAlgoDetails] = useState<boolean>(false);
  const [activeAlgoTab, setActiveAlgoTab] = useState<'greedy' | 'backtracking' | 'comparison'>('comparison');

  const [history, setHistory] = useState<Array<{
    id: string,
    number: string,
    swaps: number,
    result: string,
    approach: 'greedy' | 'backtracking',
    timestamp: Date
  }>>([]);

  const [benchmarkResults, setBenchmarkResults] = useState<{
    greedy: { time: number, result: string } | null,
    backtracking: { time: number, result: string } | null
  }>({ greedy: null, backtracking: null });

  const [isBenchmarking, setIsBenchmarking] = useState<boolean>(false);

  const [showChallengeMode, setShowChallengeMode] = useState<boolean>(false);
  const [challenges] = useState<Array<{
    id: number,
    number: string,
    swaps: number,
    description: string,
    hint: string,
    expectedResult: string,
    difficulty: 'easy' | 'medium' | 'hard'
  }>>([
    {
      id: 1,
      number: "2736",
      swaps: 1,
      description: "Maximize with a single swap",
      hint: "Look for the largest digit that can be moved to the leftmost position",
      expectedResult: "7236",
      difficulty: 'easy'
    },
    {
      id: 2,
      number: "1234",
      swaps: 2,
      description: "Maximize with two swaps",
      hint: "Start by placing the largest digit at the leftmost position",
      expectedResult: "4321",
      difficulty: 'easy'
    },
    {
      id: 3,
      number: "98761",
      swaps: 1,
      description: "Watch out for already ordered digits!",
      hint: "The largest digits are already at the left. What should you do?",
      expectedResult: "98761",
      difficulty: 'medium'
    },
    {
      id: 4,
      number: "7283419",
      swaps: 2,
      description: "Think carefully about how to use both swaps",
      hint: "Should you place 9 and 8 at the first two positions?",
      expectedResult: "9823417",
      difficulty: 'medium'
    }
  ]);
  
  const [selectedChallenge, setSelectedChallenge] = useState<number | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [answerStatus, setAnswerStatus] = useState<'pending' | 'correct' | 'incorrect'>('pending');
  const [showHint, setShowHint] = useState<boolean>(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem('danceOfDigitsHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('danceOfDigitsHistory', JSON.stringify(history));
  }, [history]);

  const addToHistory = (result: string) => {
    const historyEntry = {
      id: Date.now().toString(),
      number,
      swaps,
      result,
      approach,
      timestamp: new Date()
    };
    
    setHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const maximizeNumber = (numStr: string, k: number): [string, string[], Array<{from: number, to: number}>] => {
    if (k === 0 || numStr.length <= 1) return [numStr, [], []];
    const digits = numStr.split('');
    const stepHistory: string[] = [];
    const swapPairs: Array<{from: number, to: number}> = [];
    let swapsLeft = k;
    for (let i = 0; i < digits.length - 1 && swapsLeft > 0; i++) {
      let maxDigit = digits[i];
      let maxPos = i;
      for (let j = digits.length - 1; j > i; j--) {
        if (digits[j] > maxDigit) {
          maxDigit = digits[j];
          maxPos = j;
        }
      }
      if (maxPos !== i) {
        const beforeSwap = digits.join('');
        [digits[i], digits[maxPos]] = [digits[maxPos], digits[i]];
        swapsLeft--;
        stepHistory.push(
          `Swap ${beforeSwap[i]} and ${beforeSwap[maxPos]}: ${beforeSwap} → ${digits.join('')}`
        );
        swapPairs.push({from: i, to: maxPos});
      }
    }
    return [digits.join(''), stepHistory, swapPairs];
  };

  const maximizeNumberForAnimation = (numStr: string, k: number) => {
    const digits = numStr.split('');
    const steps: Array<{digits: string[], from: number, to: number, desc: string, type: 'highlight' | 'swap'}> = [];
    let swapsLeft = k;
    for (let i = 0; i < digits.length - 1 && swapsLeft > 0; i++) {
      let maxDigit = digits[i];
      let maxPos = i;
      for (let j = digits.length - 1; j > i; j--) {
        if (digits[j] > maxDigit) {
          maxDigit = digits[j];
          maxPos = j;
        }
      }
      if (maxPos !== i) {
        const before = [...digits];
        steps.push({
          digits: [...before],
          from: i,
          to: maxPos,
          desc: `About to swap ${before[i]} and ${before[maxPos]} in ${before.join('')}`,
          type: 'highlight',
        });
        [digits[i], digits[maxPos]] = [digits[maxPos], digits[i]];
        steps.push({
          digits: [...digits],
          from: i,
          to: maxPos,
          desc: `Swapped ${before[i]} and ${before[maxPos]}: ${before.join('')} → ${digits.join('')}`,
          type: 'swap',
        });
        swapsLeft--;
      }
    }
    return steps;
  };

  function backtrackMax(numArr: string[], k: number, idx: number, steps: any[], path: string[], best: {val: string}) {
    if (k === 0 || idx === numArr.length) {
      const candidate = numArr.join('');
      steps.push({
        digits: [...numArr],
        desc: `End of path: ${candidate}${candidate > best.val ? ' (new best)' : ''}`,
        highlight: [],
        type: 'end',
        path: [...path, candidate],
      });
      if (candidate > best.val) best.val = candidate;
      return;
    }
    let maxDigit = numArr[idx];
    for (let i = idx + 1; i < numArr.length; i++) {
      if (numArr[i] > maxDigit) maxDigit = numArr[i];
    }
    if (maxDigit === numArr[idx]) {
      steps.push({
        digits: [...numArr],
        desc: `No better digit to swap at position ${idx + 1}.`,
        highlight: [idx],
        type: 'noop',
        path: [...path],
      });
      backtrackMax(numArr, k, idx + 1, steps, path, best);
      return;
    }
    for (let i = idx + 1; i < numArr.length; i++) {
      if (numArr[i] === maxDigit) {
        steps.push({
          digits: [...numArr],
          desc: `Try swapping ${numArr[idx]} and ${numArr[i]} at positions ${idx + 1} and ${i + 1}.`,
          highlight: [idx, i],
          type: 'try',
          path: [...path],
        });
        [numArr[idx], numArr[i]] = [numArr[i], numArr[idx]];
        backtrackMax(numArr, k - 1, idx + 1, steps, [...path, numArr.join('')], best);
        [numArr[idx], numArr[i]] = [numArr[i], numArr[idx]];
        steps.push({
          digits: [...numArr],
          desc: `Backtrack: revert swap at positions ${idx + 1} and ${i + 1}.`,
          highlight: [idx, i],
          type: 'backtrack',
          path: [...path],
        });
      }
    }
  }

  function getBacktrackingSteps(numStr: string, k: number) {
    const steps: any[] = [];
    const best = {val: numStr};
    backtrackMax(numStr.split(''), k, 0, steps, [numStr], best);
    return steps;
  }

  const handleCalculate = () => {
    if (!number || swaps <= 0) return;
    setIsCalculating(true);
    setSteps([]);
    setHighlight(null);
    setTimeout(() => {
      const [maximized, history, swapPairs] = maximizeNumber(number, swaps);
      setResult(maximized);
      setSteps(history);
      setIsCalculating(false);
      addToHistory(maximized);
      if (swapPairs.length > 0) {
        let idx = 0;
        const animate = () => {
          setHighlight(swapPairs[idx]);
          idx++;
          if (idx < swapPairs.length) {
            setTimeout(animate, 700);
          } else {
            setTimeout(() => setHighlight(null), 700);
          }
        };
        animate();
      }
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 400);
    }, 800);
  };

  const handleVisualize = () => {
    if (!number || swaps <= 0) return;
    setIsAnimating(true);
    setCurrentStep(-1);
    setAnimationSteps([]);
    setTimeout(() => {
      let steps;
      if (approach === 'greedy') {
        steps = maximizeNumberForAnimation(number, swaps);
      } else {
        steps = getBacktrackingSteps(number, swaps);
      }
      setAnimationSteps(steps);
      setCurrentStep(0);
      animateSteps(steps);
    }, 500);
  };

  const animateSteps = (steps: Array<{digits: string[], from?: number, to?: number, desc: string, type: 'highlight' | 'swap' | 'noop' | 'try' | 'end' | 'backtrack', highlight?: number[], path?: string[]}>) => {
    let idx = 0;
    function next() {
      setCurrentStep(idx);
      idx++;
      if (idx < steps.length) {
        setTimeout(next, 1200);
      } else {
        setIsAnimating(false);
      }
    }
    if (steps.length > 0) setTimeout(next, 1200);
    else setIsAnimating(false);
  };

  const runBenchmark = () => {
    if (!number || swaps <= 0) return;
    
    setIsBenchmarking(true);
    setBenchmarkResults({ greedy: null, backtracking: null });
    
    setTimeout(() => {
      const greedyStart = performance.now();
      const [greedyResult] = maximizeNumber(number, swaps);
      const greedyTime = performance.now() - greedyStart;
      
      const backtrackStart = performance.now();
      const steps: any[] = [];
      const best = {val: number};
      backtrackMax(number.split(''), swaps, 0, steps, [number], best);
      const backtrackTime = performance.now() - backtrackStart;
      
      setBenchmarkResults({
        greedy: { time: greedyTime, result: greedyResult },
        backtracking: { time: backtrackTime, result: best.val }
      });
      setIsBenchmarking(false);
    }, 100);
  };

  const generateRandomTest = () => {
    const length = Math.floor(Math.random() * 6) + 3;
    let randomNum = '';
    for (let i = 0; i < length; i++) {
      randomNum += Math.floor(Math.random() * 10).toString();
    }
    const randomSwaps = Math.floor(Math.random() * (length - 1)) + 1;
    
    setNumber(randomNum);
    setSwaps(randomSwaps);
  };

  const selectChallenge = (id: number) => {
    setSelectedChallenge(id);
    setUserAnswer('');
    setAnswerStatus('pending');
    setShowHint(false);
    
    const challenge = challenges.find(c => c.id === id);
    if (challenge) {
      setNumber(challenge.number);
      setSwaps(challenge.swaps);
    }
  };
  
  const checkAnswer = () => {
    const challenge = challenges.find(c => c.id === selectedChallenge);
    if (userAnswer && challenge) {
      setAnswerStatus(userAnswer === challenge.expectedResult ? 'correct' : 'incorrect');
    }
  };

  return (
    <div className="dance-container">
      <header>
        <h1>Dance of the Digits</h1>
        <div className="difficulty-badge">Difficulty: 4/5</div>
      </header>
      
      <div className="problem-description">
        <h2>The Challenge</h2>
        <p>Given a number as a string, perform exactly K swaps (any two digits) to maximize the number.</p>
        
        <div className="action-buttons">
          <button 
            className="challenge-toggle-button"
            onClick={() => setShowChallengeMode(!showChallengeMode)}
          >
            {showChallengeMode ? 'Exit Challenge Mode' : 'Try Challenge Mode'}
          </button>
        </div>
        
        <div className="examples">
          <div className="example">
            <h3>Example 1</h3>
            <div><strong>Input:</strong> N = "2736", K = 1</div>
            <div><strong>Output:</strong> "7236"</div>
          </div>
          <div className="example">
            <h3>Example 2</h3>
            <div><strong>Input:</strong> N = "1234", K = 2</div>
            <div><strong>Output:</strong> "4231"</div>
          </div>
        </div>
      </div>
      
      {showChallengeMode && (
        <div className="challenge-section">
          <h2>Challenge Mode</h2>
          <p>Test your understanding with these carefully designed challenges. Try to solve them manually before checking the answer!</p>
          
          <div className="challenge-list">
            {challenges.map(challenge => (
              <div 
                key={challenge.id}
                className={`challenge-card ${selectedChallenge === challenge.id ? 'active' : ''} ${challenge.difficulty}`}
                onClick={() => selectChallenge(challenge.id)}
              >
                <div className="challenge-header">
                  <h3>Challenge {challenge.id}</h3>
                  <span className="challenge-difficulty">{challenge.difficulty}</span>
                </div>
                <p>{challenge.description}</p>
                <div className="challenge-details">
                  <div><strong>Number:</strong> {challenge.number}</div>
                  <div><strong>Swaps:</strong> {challenge.swaps}</div>
                </div>
              </div>
            ))}
          </div>
          
          {selectedChallenge !== null && (
            <div className="challenge-playground">
              <h3>Solve Challenge {selectedChallenge}</h3>
              
              <div className="challenge-input">
                <div className="input-group">
                  <label>Your answer:</label>
                  <input 
                    type="text" 
                    value={userAnswer} 
                    onChange={(e) => {
                      setUserAnswer(e.target.value.replace(/[^0-9]/g, ''));
                      setAnswerStatus('pending');
                    }} 
                    placeholder="Enter your solution"
                    className={answerStatus !== 'pending' ? answerStatus : ''}
                  />
                </div>
                
                <div className="challenge-buttons">
                  <button 
                    onClick={checkAnswer} 
                    disabled={!userAnswer}
                    className="check-answer-button"
                  >
                    Check Answer
                  </button>
                  <button 
                    onClick={() => setShowHint(!showHint)} 
                    className="hint-button"
                  >
                    {showHint ? 'Hide Hint' : 'Show Hint'}
                  </button>
                </div>
                
                {showHint && (
                  <div className="challenge-hint">
                    <strong>Hint:</strong> {challenges.find(c => c.id === selectedChallenge)?.hint}
                  </div>
                )}
                
                {answerStatus === 'correct' && (
                  <div className="challenge-feedback correct">
                    <span>✅ Correct! Well done.</span>
                    <div className="challenge-next">
                      {selectedChallenge < challenges.length ? (
                        <button onClick={() => selectChallenge(selectedChallenge + 1)}>
                          Next Challenge
                        </button>
                      ) : (
                        <div className="challenge-complete">
                          🎉 You've completed all challenges!
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {answerStatus === 'incorrect' && (
                  <div className="challenge-feedback incorrect">
                    <span>❌ Not quite right. Try again or view the hint.</span>
                    <div className="challenge-try-visualize">
                      <button 
                        onClick={handleVisualize} 
                        disabled={isAnimating}
                        className="visualize-button"
                      >
                        Visualize Solution
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {!showChallengeMode && (
        <>
          <div className="algo-selection">
            <h2>Select Algorithm Approach</h2>
            <div className="approach-toggle">
              <button className={approach === 'greedy' ? 'active' : ''} onClick={() => setApproach('greedy')}>
                <span className="approach-icon greedy-icon">⚡</span>
                Greedy Approach
              </button>
              <button className={approach === 'backtracking' ? 'active' : ''} onClick={() => setApproach('backtracking')}>
                <span className="approach-icon backtracking-icon">🔍</span>
                Backtracking (Optimal)
              </button>
            </div>
            <p className="approach-description">
              {approach === 'greedy' ? 
                "The greedy approach swaps digits to maximize the number from left to right, always choosing the largest possible digit for each position." : 
                "The backtracking approach explores all possible combinations of swaps to find the optimal solution that produces the maximum number."}
            </p>
            
            <button 
              className="info-button"
              onClick={() => setShowAlgoDetails(true)}
            >
              <span className="info-icon">ℹ️</span> View Algorithm Details
            </button>
          </div>

          <div className="input-section">
            <h2>Input Parameters</h2>
            <div className="input-group">
              <label htmlFor="number">Enter a number:</label>
              <div className="input-with-button">
                <input 
                  id="number"
                  type="text" 
                  value={number} 
                  onChange={(e) => setNumber(e.target.value.replace(/[^0-9]/g, ''))} 
                  placeholder="e.g. 2736"
                />
                <button 
                  className="random-button"
                  onClick={generateRandomTest}
                  title="Generate random test case"
                >
                  🎲
                </button>
              </div>
            </div>
            
            <div className="input-group">
              <label htmlFor="swaps">Number of swaps (K):</label>
              <input 
                id="swaps"
                type="number" 
                min="1"
                value={swaps} 
                onChange={(e) => setSwaps(parseInt(e.target.value) || 0)} 
                placeholder="e.g. 1"
              />
            </div>
            
            <div className="button-group">
              <button 
                onClick={handleCalculate}
                disabled={isCalculating || !number || swaps <= 0}
                className={isCalculating ? 'calculating' : 'primary-button'}
              >
                {isCalculating ? 'Dancing...' : 'Maximize Number'}
              </button>
              <button 
                onClick={handleVisualize}
                disabled={isAnimating || !number || swaps <= 0}
                className={isAnimating ? 'calculating' : 'visualize-button'}
              >
                {isAnimating ? 'Visualizing...' : 'Visualize Algorithm'}
              </button>
            </div>
          </div>
          
          {result && (
            <div className="result-section" ref={resultRef}>
              <h2>Result</h2>
              <div className="result-display">
                {result.split('').map((digit, idx) => (
                  <span
                    key={idx}
                    className={`digit${highlight && (highlight.from === idx || highlight.to === idx) ? ' highlight' : ''}`}
                  >
                    {digit}
                  </span>
                ))}
              </div>
              
              <button 
                className="explanation-toggle"
                onClick={() => setShowExplanation(!showExplanation)}
              >
                {showExplanation ? 'Hide Steps' : 'Show Steps'}
              </button>
              
              {showExplanation && steps.length > 0 && (
                <div className="steps-container">
                  <h3>Step by Step</h3>
                  <ol>
                    {steps.map((step, idx) => (
                      <li key={idx} className="step-item">{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}

          {history.length > 0 && (
            <div className="history-section">
              <h2>Your History</h2>
              <div className="history-controls">
                <button onClick={clearHistory} className="clear-history-button">
                  Clear History
                </button>
              </div>
              <div className="history-list">
                {history.map((entry) => (
                  <div key={entry.id} className="history-item">
                    <div className="history-item-header">
                      <span className="history-approach-badge">{entry.approach}</span>
                      <span className="history-time">{new Intl.DateTimeFormat('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }).format(new Date(entry.timestamp))}</span>
                    </div>
                    <div className="history-details">
                      <div className="history-input">
                        Input: {entry.number} with {entry.swaps} swap{entry.swaps !== 1 ? 's' : ''}
                      </div>
                      <div className="history-result">
                        Result: <strong>{entry.result}</strong>
                      </div>
                    </div>
                    <button 
                      className="history-rerun-button"
                      onClick={() => {
                        setNumber(entry.number);
                        setSwaps(entry.swaps);
                        setApproach(entry.approach);
                        document.querySelector('.input-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      Rerun
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {animationSteps.length > 0 && currentStep >= 0 && (
            <div className="result-section visualization-section">
              <h2>Visualization: {approach === 'greedy' ? 'Greedy Approach' : 'Backtracking (Optimal)'}</h2>
              <div className="algorithm-status">
                <span className="status-badge">{animationSteps[currentStep].type}</span>
                <span className="step-count">Step {currentStep + 1} of {animationSteps.length}</span>
              </div>
              
              <div className="pointer-row">
                {animationSteps[currentStep].digits.map((_, idx) => {
                  const isHighlight = animationSteps[currentStep].highlight && animationSteps[currentStep].highlight.includes(idx);
                  return (
                    <div key={idx} className="pointer-cell">
                      {isHighlight && (
                        <div className="pointer-label algo-label">{approach === 'greedy' ? (animationSteps[currentStep].type === 'highlight' ? (idx === animationSteps[currentStep].from ? 'Current' : 'Max') : 'Swapped') : 'Focus'}
                          <div className="arrow-down algo-arrow" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className={`result-display animate${animationSteps[currentStep].type === 'swap' ? ' swapped' : ''}`}>
                {animationSteps[currentStep].digits.map((digit, idx) => {
                  const isSwapped = animationSteps[currentStep].highlight && animationSteps[currentStep].highlight.includes(idx);
                  return (
                    <span
                      key={idx}
                      className={`digit${isSwapped ? (animationSteps[currentStep].type === 'swap' ? ' highlight-move' : ' highlight') : ''}`}
                    >
                      {digit}
                    </span>
                  );
                })}
              </div>
              <div className="step-desc">{animationSteps[currentStep].desc}</div>
              <div className="step-controls">
                <button 
                  onClick={() => setCurrentStep(s => Math.max(0, s - 1))} 
                  disabled={currentStep === 0 || isAnimating}
                  className="control-button prev-button"
                >
                  Previous Step
                </button>
                <button 
                  onClick={() => setCurrentStep(0)} 
                  disabled={currentStep === 0 || isAnimating}
                  className="control-button reset-button"
                >
                  Reset
                </button>
                <button 
                  onClick={() => setCurrentStep(s => Math.min(animationSteps.length - 1, s + 1))} 
                  disabled={currentStep === animationSteps.length - 1 || isAnimating}
                  className="control-button next-button"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}
          
          <div className="benchmark-section">
            <h2>Algorithm Performance Benchmark</h2>
            <p className="benchmark-description">
              Compare the performance of both algorithms with your current input. 
              This will help you understand how computational complexity affects real execution time.
            </p>
            
            <button 
              onClick={runBenchmark}
              disabled={isBenchmarking || !number || swaps <= 0}
              className={isBenchmarking ? 'calculating' : 'benchmark-button'}
            >
              {isBenchmarking ? 'Benchmarking...' : 'Run Performance Benchmark'}
            </button>
            
            {(benchmarkResults.greedy || benchmarkResults.backtracking) && (
              <div className="benchmark-results">
                <div className="benchmark-result-item">
                  <h3>Greedy Algorithm</h3>
                  <div className="benchmark-stats">
                    <div className="benchmark-time">
                      <span className="benchmark-label">Execution Time:</span>
                      <span className="benchmark-value">{benchmarkResults.greedy?.time.toFixed(2)} ms</span>
                    </div>
                    <div className="benchmark-answer">
                      <span className="benchmark-label">Result:</span>
                      <span className="benchmark-value">{benchmarkResults.greedy?.result}</span>
                    </div>
                  </div>
                </div>
                
                <div className="benchmark-result-item">
                  <h3>Backtracking Algorithm</h3>
                  <div className="benchmark-stats">
                    <div className="benchmark-time">
                      <span className="benchmark-label">Execution Time:</span>
                      <span className="benchmark-value">{benchmarkResults.backtracking?.time.toFixed(2)} ms</span>
                    </div>
                    <div className="benchmark-answer">
                      <span className="benchmark-label">Result:</span>
                      <span className="benchmark-value">{benchmarkResults.backtracking?.result}</span>
                    </div>
                  </div>
                </div>
                
                <div className="benchmark-comparison">
                  <h3>Performance Comparison</h3>
                  {benchmarkResults.greedy && benchmarkResults.backtracking && (
                    <>
                      <div className="benchmark-bar-container">
                        <div className="benchmark-labels">
                          <span>Greedy</span>
                          <span>Backtracking</span>
                        </div>
                        <div className="benchmark-bars">
                          <div 
                            className="benchmark-bar greedy-bar" 
                            style={{ 
                              width: `${Math.min(100, (benchmarkResults.greedy.time / Math.max(benchmarkResults.greedy.time, benchmarkResults.backtracking.time)) * 100)}%` 
                            }}
                          >
                            {benchmarkResults.greedy.time.toFixed(2)} ms
                          </div>
                          <div 
                            className="benchmark-bar backtracking-bar" 
                            style={{ 
                              width: `${Math.min(100, (benchmarkResults.backtracking.time / Math.max(benchmarkResults.greedy.time, benchmarkResults.backtracking.time)) * 100)}%` 
                            }}
                          >
                            {benchmarkResults.backtracking.time.toFixed(2)} ms
                          </div>
                        </div>
                      </div>
                      
                      <div className="benchmark-insights">
                        <p>
                          {benchmarkResults.greedy.result === benchmarkResults.backtracking.result ? 
                            "Both algorithms produced the same result. " : 
                            "The algorithms produced different results. This demonstrates that the greedy approach doesn't always find the optimal solution. "
                          }
                          {benchmarkResults.greedy.time < benchmarkResults.backtracking.time ? 
                            `The greedy algorithm was ${(benchmarkResults.backtracking.time / benchmarkResults.greedy.time).toFixed(1)}x faster.` : 
                            `The backtracking algorithm was ${(benchmarkResults.greedy.time / benchmarkResults.backtracking.time).toFixed(1)}x faster.`
                          }
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
      
      {showAlgoDetails && (
        <div className="modal-overlay" onClick={() => setShowAlgoDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowAlgoDetails(false)}>×</button>
            
            <h2>Algorithm Details</h2>
            
            <div className="modal-tabs">
              <button 
                className={activeAlgoTab === 'comparison' ? 'active' : ''}
                onClick={() => setActiveAlgoTab('comparison')}
              >
                Comparison
              </button>
              <button 
                className={activeAlgoTab === 'greedy' ? 'active' : ''}
                onClick={() => setActiveAlgoTab('greedy')}
              >
                Greedy
              </button>
              <button 
                className={activeAlgoTab === 'backtracking' ? 'active' : ''}
                onClick={() => setActiveAlgoTab('backtracking')}
              >
                Backtracking
              </button>
            </div>
            
            {activeAlgoTab === 'comparison' && (
              <div className="algo-comparison">
                <table className="comparison-table">
                  <thead>
                    <tr>
                      <th>Feature</th>
                      <th>Greedy Approach</th>
                      <th>Backtracking Approach</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Time Complexity</td>
                      <td>O(n²)</td>
                      <td>O(n! × k)</td>
                    </tr>
                    <tr>
                      <td>Space Complexity</td>
                      <td>O(n)</td>
                      <td>O(n × k)</td>
                    </tr>
                    <tr>
                      <td>Optimal Solution</td>
                      <td>Not always guaranteed</td>
                      <td>Always guaranteed</td>
                    </tr>
                    <tr>
                      <td>Best For</td>
                      <td>Larger inputs, performance-critical scenarios</td>
                      <td>Smaller inputs, when optimality is required</td>
                    </tr>
                  </tbody>
                </table>
                
                <div className="comparison-summary">
                  <p>
                    <strong>When to use Greedy:</strong> Use the greedy approach when dealing with larger numbers or when performance is critical. It works well for most practical cases and has predictable execution time.
                  </p>
                  <p>
                    <strong>When to use Backtracking:</strong> Use the backtracking approach when you need a guaranteed optimal solution, especially for smaller inputs or when the greedy approach is known to fail for specific patterns.
                  </p>
                </div>
              </div>
            )}
            
            {activeAlgoTab === 'greedy' && (
              <div className="algo-details">
                <h3>Greedy Algorithm</h3>
                
                <div className="complexity-section">
                  <div className="complexity-item">
                    <h4>Time Complexity</h4>
                    <div className="complexity">O(n²)</div>
                    <p>Where n is the number of digits in the input.</p>
                  </div>
                  <div className="complexity-item">
                    <h4>Space Complexity</h4>
                    <div className="complexity">O(n)</div>
                    <p>Only requires space to store the digits.</p>
                  </div>
                </div>
                
                <div className="algo-insight">
                  <h4>How it Works</h4>
                  <p>
                    The greedy algorithm processes the number from left to right, position by position:
                  </p>
                  <ol>
                    <li>For the leftmost position, find the largest digit in the entire number.</li>
                    <li>If that digit is not already in the current position, swap it.</li>
                    <li>Move to the next position and repeat, but only use remaining swaps.</li>
                    <li>Continue until all swaps are used or all positions are processed.</li>
                  </ol>
                  
                  <h4>Advantages</h4>
                  <ul>
                    <li>Simple and efficient implementation</li>
                    <li>Works well for most inputs</li>
                    <li>Predictable performance</li>
                    <li>Handles large numbers efficiently</li>
                  </ul>
                  
                  <h4>Limitations</h4>
                  <ul>
                    <li>May not find the optimal solution in some cases</li>
                    <li>Cannot backtrack from suboptimal choices</li>
                    <li>Performance depends on input patterns</li>
                  </ul>
                  
                  <h4>Edge Cases</h4>
                  <p>
                    The greedy approach can fail to find the optimal solution when the best choice at a position doesn't lead to the overall best result. Consider "5432" with 1 swap - greedy would not swap anything (as larger digits are already at the left), but swapping 5 and 2 would yield "2435".
                  </p>
                </div>
              </div>
            )}
            
            {activeAlgoTab === 'backtracking' && (
              <div className="algo-details">
                <h3>Backtracking Algorithm</h3>
                
                <div className="complexity-section">
                  <div className="complexity-item">
                    <h4>Time Complexity</h4>
                    <div className="complexity">O(n! × k)</div>
                    <p>Where n is the number of digits and k is the number of swaps.</p>
                  </div>
                  <div className="complexity-item">
                    <h4>Space Complexity</h4>
                    <div className="complexity">O(n × k)</div>
                    <p>Due to recursion and storing paths.</p>
                  </div>
                </div>
                
                <div className="algo-insight">
                  <h4>How it Works</h4>
                  <p>
                    The backtracking algorithm explores all possible swap combinations:
                  </p>
                  <ol>
                    <li>Start with the given number and no swaps made.</li>
                    <li>For each position, try swapping with each position to the right.</li>
                    <li>Recursively explore the result of each swap.</li>
                    <li>Keep track of the maximum number found so far.</li>
                    <li>If we've used all swaps or reached the end, compare with the current maximum.</li>
                    <li>Backtrack (undo swaps) and try different combinations.</li>
                  </ol>
                  
                  <h4>Advantages</h4>
                  <ul>
                    <li>Guarantees the optimal solution</li>
                    <li>Explores all possible combinations</li>
                    <li>Can handle edge cases where greedy fails</li>
                  </ul>
                  
                  <h4>Limitations</h4>
                  <ul>
                    <li>Exponential time complexity makes it inefficient for large inputs</li>
                    <li>High memory usage due to recursion</li>
                    <li>Overkill for many simple cases</li>
                  </ul>
                  
                  <h4>Optimization Techniques</h4>
                  <p>
                    The backtracking approach can be optimized by:
                  </p>
                  <ul>
                    <li>Branch and bound: Skip exploring paths that cannot lead to better solutions.</li>
                    <li>Memoization: Store results of already computed subproblems.</li>
                    <li>Early termination: Exit when a known optimal solution is found.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <footer>
        <div className="algo-info">
          <h3>About The Dance of Digits Algorithm</h3>
          <p>This algorithmic challenge focuses on maximizing a number by performing exactly K swaps between any two digits.</p>
          <p><strong>Greedy Approach:</strong> Always places the largest available digit in the leftmost possible position. While efficient, it may not always find the optimal solution for all inputs.</p>
          <p><strong>Backtracking Approach:</strong> Systematically explores all possible swap combinations to guarantee finding the largest possible number. This approach is optimal but has higher computational complexity.</p>
        </div>
      </footer>
    </div>
  );
}

export default App
