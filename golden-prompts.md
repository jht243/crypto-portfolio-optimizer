# Golden Prompt Set - Crypto Yield Optimizer

This document contains test prompts to validate the Crypto Yield Optimizer connector's metadata and behavior.

## Purpose
Use these prompts to test:
- **Precision**: Does the right tool get called?
- **Recall**: Does the tool get called when it should?
- **Accuracy**: Are the right parameters passed?

---

## Direct Prompts (Should ALWAYS trigger the connector)

### 1. No Arguments
**Prompt**: "Optimize my crypto portfolio"
**Expected**: Calls `optimize_portfolio` with no arguments (empty `{}`)
**Status**: [ ] Pass / [ ] Fail

### 2. Single Holding (BTC)
**Prompt**: "I have $10,000 in Bitcoin"
**Expected**: Calls `optimize_portfolio` with `btc: 10000`
**Status**: [ ] Pass / [ ] Fail

### 3. Two Holdings (BTC + ETH)
**Prompt**: "I have $10,000 in Bitcoin and $5,000 in Ethereum"
**Expected**: Calls `optimize_portfolio` with `btc: 10000, eth: 5000`
**Status**: [ ] Pass / [ ] Fail

### 4. Three Holdings + Risk
**Prompt**: "I have $10k in BTC, $5k in ETH, $2k in SOL, and I want low risk strategies"
**Expected**: Calls `optimize_portfolio` with `btc: 10000, eth: 5000, sol: 2000, risk_preference: "low"`
**Status**: [ ] Pass / [ ] Fail

### 5. Holdings + Current Yield
**Prompt**: "I have $50,000 in Bitcoin and I'm currently earning 2% APY"
**Expected**: Calls `optimize_portfolio` with `btc: 50000, current_yield_percent: 2`
**Status**: [ ] Pass / [ ] Fail

---

## Indirect Prompts (Should trigger the connector)

### 6. Yield Question
**Prompt**: "How can I earn yield on my crypto?"
**Expected**: Calls `optimize_portfolio` with no arguments
**Status**: [ ] Pass / [ ] Fail

### 7. Strategy Question
**Prompt**: "What's the best way to earn interest on Solana?"
**Expected**: Calls `optimize_portfolio` (may infer SOL context)
**Status**: [ ] Pass / [ ] Fail

### 8. Passive Income
**Prompt**: "Find passive income opportunities for my crypto"
**Expected**: Calls `optimize_portfolio`
**Status**: [ ] Pass / [ ] Fail

---

## Negative Prompts (Should NOT trigger the connector)

### 9. Coin Picks
**Prompt**: "What coins should I buy?"
**Expected**: Does NOT call `optimize_portfolio` (specific investment advice)
**Status**: [ ] Pass / [ ] Fail

### 10. Tax Advice
**Prompt**: "How do I minimize taxes on crypto?"
**Expected**: Does NOT call `optimize_portfolio` (tax advice)
**Status**: [ ] Pass / [ ] Fail

### 11. Trading Signals
**Prompt**: "Best time to buy Bitcoin"
**Expected**: Does NOT call `optimize_portfolio` (trading advice)
**Status**: [ ] Pass / [ ] Fail

---

## Edge Cases

### 12. Single Holding (SOL)
**Prompt**: "I have $5,000 in Solana"
**Expected**: Calls `optimize_portfolio` with `sol: 5000`
**Status**: [ ] Pass / [ ] Fail

### 13. Large Portfolio
**Prompt**: "$50,000 in Bitcoin and $20,000 in Ethereum"
**Expected**: Calls `optimize_portfolio` with `btc: 50000, eth: 20000`
**Status**: [ ] Pass / [ ] Fail

---

## Testing Instructions

### How to Test
1. Open ChatGPT in **Developer Mode**
2. Link the Crypto Yield Optimizer connector
3. For each prompt above:
   - Enter the exact prompt
   - Observe which tool gets called
   - Check the parameters passed
   - Verify the widget renders correctly
   - Mark Pass/Fail in the Status column
