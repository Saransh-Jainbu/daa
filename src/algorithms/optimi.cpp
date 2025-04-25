#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

void optimizedBacktrack(string& str, int k, int n, string& max_str, int current_pos) {
    if (k == 0) return;
    
    for (int i = current_pos; i < n - 1; i++) {
        for (int j = i + 1; j < n; j++) {
            if (str[i] < str[j]) {
                swap(str[i], str[j]);
                if (str > max_str) max_str = str;
                optimizedBacktrack(str, k - 1, n, max_str, i + 1);
                swap(str[i], str[j]);
            }
        }
    }
}

string findMaximumNumber(string str, int k) {
    string max_str = str;
    optimizedBacktrack(str, k, str.length(), max_str, 0);
    return max_str;
}

int main() {
    string str = "93561";
    int k = 2;
    cout << "Maximum number: " << findMaximumNumber(str, k) << endl;
    return 0;
}
