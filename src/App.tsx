import { useState, useRef } from 'react'
import './App.css'

function App() {
  const [number, setNumber] = useState<string>('')
  const [swaps, setSwaps] = useState<number>(0)
  const [result, setResult] = useState<string>('')
  const [isCalculating, setIsCalculating] = useState<boolean>(false)
  const [steps, setSteps] = useState<string[]>([])
  const [showExplanation, setShowExplanation] = useState<boolean>(false)
  const [highlight, setHighlight] = useState<{from: number, to: number} | null>(null)
  const [animationSteps, setAnimationSteps] = useState<Array<{digits: string[], from: number, to: number, desc: string, type: 'highlight' | 'swap'}>>([]);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const resultRef = useRef<HTMLDivElement>(null)

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
        // Step 1: highlight which will be swapped
        steps.push({
          digits: [...before],
          from: i,
          to: maxPos,
          desc: `About to swap ${before[i]} and ${before[maxPos]} in ${before.join('')}`,
          type: 'highlight',
        });
        // Step 2: show swapped
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
      const steps = maximizeNumberForAnimation(number, swaps);
      setAnimationSteps(steps);
      setCurrentStep(0);
      animateSteps(steps);
    }, 500);
  };

  const animateSteps = (steps: Array<{digits: string[], from: number, to: number, desc: string, type: 'highlight' | 'swap'}>) => {
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

  return (
    <div className="dance-container">
      <header>
        <h1>Dance of the Digits</h1>
        <div className="difficulty-badge">Difficulty: 4/5</div>
      </header>
      
      <div className="problem-description">
        <h2>The Challenge</h2>
        <p>Given a number as a string, perform exactly K swaps (any two digits) to maximize the number.</p>
        
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
      
      <div className="input-section">
        <div className="input-group">
          <label htmlFor="number">Enter a number:</label>
          <input 
            id="number"
            type="text" 
            value={number} 
            onChange={(e) => setNumber(e.target.value.replace(/[^0-9]/g, ''))} 
            placeholder="e.g. 2736"
          />
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
        
        <button 
          onClick={handleCalculate}
          disabled={isCalculating || !number || swaps <= 0}
          className={isCalculating ? 'calculating' : ''}
        >
          {isCalculating ? 'Dancing...' : 'Maximize!'}
        </button>
        <button 
          onClick={handleVisualize}
          disabled={isAnimating || !number || swaps <= 0}
          className={isAnimating ? 'calculating' : ''}
        >
          {isAnimating ? 'Visualizing...' : 'Visualize Algorithm!'}
        </button>
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

      {animationSteps.length > 0 && currentStep >= 0 && (
        <div className="result-section">
          <h2>Visualization</h2>
          <div className="pointer-row">
            {animationSteps[currentStep].digits.map((_, idx) => {
              const isCurrent = idx === animationSteps[currentStep].from;
              const isMax = idx === animationSteps[currentStep].to;
              return (
                <div key={idx} className="pointer-cell">
                  {animationSteps[currentStep].type === 'highlight' && isCurrent && (
                    <div className="pointer-label current-label">Current
                      <div className="arrow-down current-arrow" />
                    </div>
                  )}
                  {animationSteps[currentStep].type === 'highlight' && isMax && (
                    <div className="pointer-label max-label">Max
                      <div className="arrow-down max-arrow" />
                    </div>
                  )}
                  {animationSteps[currentStep].type === 'swap' && (isCurrent || isMax) && (
                    <div className="pointer-label swap-label">Swapped
                      <div className="arrow-down swap-arrow" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className={`result-display animate${animationSteps[currentStep].type === 'swap' ? ' swapped' : ''}`}>
            {animationSteps[currentStep].digits.map((digit, idx) => {
              const isSwapped = idx === animationSteps[currentStep].from || idx === animationSteps[currentStep].to;
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
            <button onClick={() => setCurrentStep(s => Math.max(0, s - 1))} disabled={currentStep === 0 || isAnimating}>Prev</button>
            <span>Step {currentStep + 1} / {animationSteps.length}</span>
            <button onClick={() => setCurrentStep(s => Math.min(animationSteps.length - 1, s + 1))} disabled={currentStep === animationSteps.length - 1 || isAnimating}>Next</button>
          </div>
        </div>
      )}
      
      <footer>
        <div className="algo-info">
          <h3>About This Algorithm</h3>
          <p>This solution uses a greedy approach, always swapping to get the largest possible digit at each position from left to right.</p>
        </div>
      </footer>
    </div>
  );
}

export default App
