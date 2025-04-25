#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

void backtrack(string& str, int k, int n, string& max_str) {
    if (k == 0) return;
    
    for (int i = 0; i < n - 1; i++) {
        for (int j = i + 1; j < n; j++) {
            swap(str[i], str[j]);
            if (str > max_str) max_str = str;
            backtrack(str, k - 1, n, max_str);
            swap(str[i], str[j]);
        }
    }
}

string findMaximumNumber(string str, int k) {
    string max_str = str;
    backtrack(str, k, str.length(), max_str);
    return max_str;
}

int main() {
    string str = "93561";
    int k = 2;
    cout << "Maximum number: " << findMaximumNumber(str, k) << endl;
    return 0;
}
