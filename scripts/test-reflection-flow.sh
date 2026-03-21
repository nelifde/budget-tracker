#!/usr/bin/env bash
# Test reflection flow: 5+ impulsive in same category triggers feeling-log prompt.
set -e
API="${API_BASE:-http://localhost:4000}"
USER_ID="test-reflection-$(date +%s)"
H="Content-Type: application/json"
X="x-user-id: $USER_ID"

echo "1. Bootstrap dev user and get Food category..."
CATS=$(curl -s -H "$H" -H "$X" "$API/api/categories")
FOOD_ID=$(echo "$CATS" | node -e "
const d = JSON.parse(require('fs').readFileSync(0,'utf8'));
const c = d.find(x => x.name === 'Food');
console.log(c ? c.id : '');
")
if [ -z "$FOOD_ID" ]; then
  echo "FAIL: No Food category found. Response: $CATS"
  exit 1
fi
echo "   Food category id: $FOOD_ID"

echo "2. Create 5 impulsive expenses in Food (last 7 days)..."
for i in 1 2 3 4 5; do
  curl -s -X POST -H "$H" -H "$X" "$API/api/quick/expense" \
    -d "{\"amount\": 5.00, \"spendType\": \"IMPULSIVE\", \"categoryId\": \"$FOOD_ID\"}" > /dev/null
  echo "   Expense $i created"
done

echo "3. Fetch coach reflection (expect requestFeelingLog)..."
REFLECTION=$(curl -s -H "$X" "$API/api/coach/reflection")
echo "$REFLECTION" | node -e "
const d = JSON.parse(require('fs').readFileSync(0,'utf8'));
if (!d.prompt) {
  console.error('FAIL: No prompt returned');
  process.exit(1);
}
if (!d.requestFeelingLog) {
  console.error('FAIL: requestFeelingLog should be true');
  process.exit(1);
}
if (d.trigger !== 'same_category') {
  console.error('FAIL: trigger should be same_category, got', d.trigger);
  process.exit(1);
}
if (d.categoryName !== 'Food') {
  console.error('FAIL: categoryName should be Food, got', d.categoryName);
  process.exit(1);
}
console.log('OK: prompt=', d.prompt.substring(0, 60) + '...');
console.log('OK: requestFeelingLog=', d.requestFeelingLog);
console.log('OK: trigger=', d.trigger);
console.log('OK: categoryName=', d.categoryName);
"

echo ""
echo "Reflection flow test passed. Open the app, use the same dev user id in localStorage (budget_tracker_dev_user_id = $USER_ID) to see the ReflectionLogSheet, or run with a fresh user in the UI and log 5+ impulsive Food expenses."
echo "To use this user in the browser: localStorage.setItem('budget_tracker_dev_user_id', '$USER_ID'); then refresh."
