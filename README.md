# Dance of the Digits

![Dance of the Digits](https://img.shields.io/badge/Algorithm-Visualization-4361ee)
![React](https://img.shields.io/badge/React-19.0.0-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-3178C6)
![Difficulty](https://img.shields.io/badge/Difficulty-4%2F5-f72585)

An interactive algorithmic visualization platform that demonstrates the "Dance of the Digits" problem: maximizing a number by performing exactly K swaps between any two digits.

![Application Screenshot](public/screenshot.png)

## 🚀 Features

### Multiple Algorithm Approaches

- **Greedy Algorithm**: Maximizes the number by swapping from left to right, always choosing the largest digit for each position.
- **Backtracking (Optimal) Algorithm**: Explores all possible combinations of swaps to find the guaranteed maximum.

### Interactive Visualization

- Step-by-step visual walkthrough of each algorithm's execution
- Color-coded highlighting of swapped digits
- Detailed explanations for each algorithmic step
- Controls to navigate forwards and backwards through the algorithm's steps

### Educational Components

- **Algorithm Details**: Comprehensive information about each algorithm:
  - Time and space complexity analysis
  - Advantages and limitations
  - Step-by-step implementation details
  - Optimization techniques

- **Challenge Mode**: Test your understanding with pre-designed challenges:
  - Multiple difficulty levels (Easy, Medium, Hard)
  - Hints and feedback
  - Interactive verification of answers

- **Performance Benchmarking**: Compare the two algorithms with real-time metrics:
  - Execution time measurements
  - Visual comparison of performance
  - Analysis of results and speed differences

### User-Friendly Features

- **History Tracking**: Save and reuse previous calculations
- **Random Test Generator**: Create random test cases with a single click
- **Responsive Design**: Works on desktop and mobile devices

## 🔧 Technical Implementation

The application is built with:

- **React 19** with hooks for state management
- **TypeScript** for type safety
- **Vite** for fast development and optimized builds
- **Modern CSS** with animations and responsive design

## 🧠 The Algorithm Problem

Given a number represented as a string and an integer K, the challenge is to find the maximum possible number after performing at most K swaps between any two digits.

### Example:

```
Input: N = "2736", K = 1
Output: "7236"
```

```
Input: N = "1234", K = 2
Output: "4231"
```

### Algorithm Comparison

| Feature | Greedy Approach | Backtracking Approach |
|---------|----------------|----------------------|
| Time Complexity | O(n²) | O(n! × k) |
| Space Complexity | O(n) | O(n × k) |
| Optimal Solution | Not always guaranteed | Always guaranteed |
| Best For | Larger inputs, performance-critical scenarios | Smaller inputs, when optimality is required |

## 🚦 Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/dance-of-digits.git
   cd dance-of-digits
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Build for production
   ```bash
   npm run build
   # or
   yarn build
   ```

## 📚 Learning Resources

The Dance of Digits problem demonstrates important algorithmic concepts:

- **Greedy Algorithms**: Making locally optimal choices at each step
- **Backtracking**: Exploring all possible solutions through systematic trial and error
- **Algorithm Analysis**: Understanding time and space complexity tradeoffs

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](#).

## 📝 License

This project is [MIT](LICENSE) licensed.

## 🙏 Acknowledgements

- Design inspiration from modern educational platforms
- Algorithm visualization techniques from academic resources
