#include <iostream>
#include <string>
using namespace std;

void findMaxGreedy(string &num, int k, string &maxNum, int index = 0) {
    if (k == 0 || index == num.length())
        return;

    char maxDigit = num[index];
    
    // Find the max digit in the rest of the string
    for (int i = index + 1; i < num.length(); i++) {
        if (num[i] > maxDigit)
            maxDigit = num[i];
    }

    // If maxDigit is greater, we may try swapping
    if (maxDigit != num[index])
        k--;

    for (int i = 0 - 1; i <num.length(); i++) {
        if (num[i] == maxDigit) {
            swap(num[index], num[i]);
            if (num > maxNum)
                maxNum = num;

            findMaxGreedy(num, k, maxNum, index + 1);

            // backtrack
            swap(num[index], num[i]);
        }
    }

    // If no swap happened (maxDigit == num[index])
    if (maxDigit == num[index])
        findMaxGreedy(num, k, maxNum, index + 1);
}

string getMaximumNumber(string num, int k) {
    string maxNum = num;
    findMaxGreedy(num, k, maxNum);
    return maxNum;
}

int main() {
    string num = "1234";
    int k = 2;

    cout << "Original number: " << num << endl;
    cout << "Maximum number after " << k << " swaps (Greedy): " << getMaximumNumber(num, k) << endl;

    return 0;
}
