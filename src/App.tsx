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
  const [animationSteps, setAnimationSteps] = useState<Array<{digits: string[], from?: number, to?: number, desc: string, type: 'highlight' | 'swap' | 'noop' | 'try' | 'end' | 'backtrack', highlight?: number[], path?: string[]}>>([]);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [approach, setApproach] = useState<'greedy' | 'backtracking'>('greedy');
  const resultRef = useRef<HTMLDivElement>(null)

  const [showAlgoDetails, setShowAlgoDetails] = useState<boolean>(false);
  const [activeAlgoTab, setActiveAlgoTab] = useState<'greedy' | 'backtracking' | 'comparison'>('comparison');

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
        [numArr[idx], numArr[i]] = [numArr[i], numArr[idx]]; // backtrack
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
              <div className="algo-details"></div>
                <h3>Backtracking Algorithm</h3>
                
                <div className="complexity-section"></div>
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
                
                <div className="algo-insight"></div>
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
