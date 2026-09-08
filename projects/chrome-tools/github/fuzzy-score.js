/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// 从 VS Code src/vs/base/common/filters.ts 提取的 fuzzyScore 算法，
// 经 pink fuzzy-score.ts 移植为纯 JS（content script 为经典脚本，顶层声明即全局，供 index.js 使用）。

// region --- CharCode (内联所需值) ---

const CharCode_Tab = 9;
const CharCode_Space = 32;
const CharCode_DoubleQuote = 34;
const CharCode_DollarSign = 36;
const CharCode_SingleQuote = 39;
const CharCode_OpenParen = 40;
const CharCode_CloseParen = 41;
const CharCode_Dash = 45;
const CharCode_Period = 46;
const CharCode_Slash = 47;
const CharCode_Colon = 58;
const CharCode_LessThan = 60;
const CharCode_GreaterThan = 62;
const CharCode_OpenSquareBracket = 91;
const CharCode_Backslash = 92;
const CharCode_CloseSquareBracket = 93;
const CharCode_Underline = 95;
const CharCode_OpenCurlyBrace = 123;
const CharCode_CloseCurlyBrace = 125;

// endregion

// region --- strings.isEmojiImprecise ---

function isEmojiImprecise(x) {
    return (
        (x >= 0x1f1e6 && x <= 0x1f1ff) ||
        x === 8986 ||
        x === 8987 ||
        x === 9200 ||
        x === 9203 ||
        (x >= 9728 && x <= 10175) ||
        x === 11088 ||
        x === 11093 ||
        (x >= 127744 && x <= 128591) ||
        (x >= 128640 && x <= 128764) ||
        (x >= 128992 && x <= 129008) ||
        (x >= 129280 && x <= 129535) ||
        (x >= 129648 && x <= 129782)
    );
}

// endregion

/**
 * FuzzyScore 为一个数组：
 * 0. 分数
 * 1. 匹配起始 offset
 * 2..N. 各匹配位置
 */
const FuzzyScoreDefault = [-100, 0];

function isFuzzyScoreDefault(score) {
    return !score || (score.length === 2 && score[0] === -100 && score[1] === 0);
}

const FuzzyScoreOptions = {
    default: { firstMatchCanBeWeak: false, boostFullMatch: true },
};

// region --- fuzzyScore 核心 ---

const _maxLen = 128;

function initTable() {
    const table = [];
    const row = [];
    for (let i = 0; i <= _maxLen; i++) {
        row[i] = 0;
    }
    for (let i = 0; i <= _maxLen; i++) {
        table.push(row.slice(0));
    }
    return table;
}

function initArr(maxLen) {
    const row = [];
    for (let i = 0; i <= maxLen; i++) {
        row[i] = 0;
    }
    return row;
}

const _minWordMatchPos = initArr(2 * _maxLen);
const _maxWordMatchPos = initArr(2 * _maxLen);
const _diag = initTable();
const _table = initTable();

const Arrow_Diag = 1;
const Arrow_Left = 2;
const Arrow_LeftLeft = 3;
const _arrows = initTable();

function isSeparatorAtPos(value, index) {
    if (index < 0 || index >= value.length) {
        return false;
    }
    const code = value.codePointAt(index);
    switch (code) {
        case CharCode_Underline:
        case CharCode_Dash:
        case CharCode_Period:
        case CharCode_Space:
        case CharCode_Slash:
        case CharCode_Backslash:
        case CharCode_SingleQuote:
        case CharCode_DoubleQuote:
        case CharCode_Colon:
        case CharCode_DollarSign:
        case CharCode_LessThan:
        case CharCode_GreaterThan:
        case CharCode_OpenParen:
        case CharCode_CloseParen:
        case CharCode_OpenSquareBracket:
        case CharCode_CloseSquareBracket:
        case CharCode_OpenCurlyBrace:
        case CharCode_CloseCurlyBrace:
            return true;
        case undefined:
            return false;
        default:
            if (isEmojiImprecise(code)) {
                return true;
            }
            return false;
    }
}

function isWhitespaceAtPos(value, index) {
    if (index < 0 || index >= value.length) {
        return false;
    }
    const code = value.charCodeAt(index);
    switch (code) {
        case CharCode_Space:
        case CharCode_Tab:
            return true;
        default:
            return false;
    }
}

function isUpperCaseAtPos(pos, word, wordLow) {
    return word[pos] !== wordLow[pos];
}

function isPatternInWord(patternLow, patternPos, patternLen, wordLow, wordPos, wordLen, fillMinWordPosArr = false) {
    while (patternPos < patternLen && wordPos < wordLen) {
        if (patternLow[patternPos] === wordLow[wordPos]) {
            if (fillMinWordPosArr) {
                _minWordMatchPos[patternPos] = wordPos;
            }
            patternPos += 1;
        }
        wordPos += 1;
    }
    return patternPos === patternLen;
}

function _fillInMaxWordMatchPos(patternLen, wordLen, patternStart, wordStart, patternLow, wordLow) {
    let patternPos = patternLen - 1;
    let wordPos = wordLen - 1;
    while (patternPos >= patternStart && wordPos >= wordStart) {
        if (patternLow[patternPos] === wordLow[wordPos]) {
            _maxWordMatchPos[patternPos] = wordPos;
            patternPos--;
        }
        wordPos--;
    }
}

function _doScore(
    pattern,
    patternLow,
    patternPos,
    patternStart,
    word,
    wordLow,
    wordPos,
    wordLen,
    wordStart,
    newMatchStart,
    outFirstMatchStrong,
) {
    if (patternLow[patternPos] !== wordLow[wordPos]) {
        return Number.MIN_SAFE_INTEGER;
    }

    let score = 1;
    let isGapLocation = false;
    if (wordPos === patternPos - patternStart) {
        score = pattern[patternPos] === word[wordPos] ? 7 : 5;
    } else if (isUpperCaseAtPos(wordPos, word, wordLow) && (wordPos === 0 || !isUpperCaseAtPos(wordPos - 1, word, wordLow))) {
        score = pattern[patternPos] === word[wordPos] ? 7 : 5;
        isGapLocation = true;
    } else if (isSeparatorAtPos(wordLow, wordPos) && (wordPos === 0 || !isSeparatorAtPos(wordLow, wordPos - 1))) {
        score = 5;
    } else if (isSeparatorAtPos(wordLow, wordPos - 1) || isWhitespaceAtPos(wordLow, wordPos - 1)) {
        score = 5;
        isGapLocation = true;
    }

    if (score > 1 && patternPos === patternStart) {
        outFirstMatchStrong[0] = true;
    }

    if (!isGapLocation) {
        isGapLocation =
            isUpperCaseAtPos(wordPos, word, wordLow) || isSeparatorAtPos(wordLow, wordPos - 1) || isWhitespaceAtPos(wordLow, wordPos - 1);
    }

    if (patternPos === patternStart) {
        if (wordPos > wordStart) {
            score -= isGapLocation ? 3 : 5;
        }
    } else {
        if (newMatchStart) {
            score += isGapLocation ? 2 : 0;
        } else {
            score += isGapLocation ? 0 : 1;
        }
    }

    if (wordPos + 1 === wordLen) {
        score -= isGapLocation ? 3 : 5;
    }

    return score;
}

function fuzzyScore(pattern, patternLow, patternStart, word, wordLow, wordStart, options = FuzzyScoreOptions.default) {
    const patternLen = pattern.length > _maxLen ? _maxLen : pattern.length;
    const wordLen = word.length > _maxLen ? _maxLen : word.length;

    if (patternStart >= patternLen || wordStart >= wordLen || patternLen - patternStart > wordLen - wordStart) {
        return undefined;
    }

    if (!isPatternInWord(patternLow, patternStart, patternLen, wordLow, wordStart, wordLen, true)) {
        return undefined;
    }

    _fillInMaxWordMatchPos(patternLen, wordLen, patternStart, wordStart, patternLow, wordLow);

    let row = 1;
    let column = 1;
    let patternPos = patternStart;
    let wordPos = wordStart;

    const hasStrongFirstMatch = [false];

    for (row = 1, patternPos = patternStart; patternPos < patternLen; row++, patternPos++) {
        const minWordMatchPos = _minWordMatchPos[patternPos];
        const maxWordMatchPos = _maxWordMatchPos[patternPos];
        const nextMaxWordMatchPos = patternPos + 1 < patternLen ? _maxWordMatchPos[patternPos + 1] : wordLen;

        for (column = minWordMatchPos - wordStart + 1, wordPos = minWordMatchPos; wordPos < nextMaxWordMatchPos; column++, wordPos++) {
            let score = Number.MIN_SAFE_INTEGER;
            let canComeDiag = false;

            if (wordPos <= maxWordMatchPos) {
                score = _doScore(
                    pattern,
                    patternLow,
                    patternPos,
                    patternStart,
                    word,
                    wordLow,
                    wordPos,
                    wordLen,
                    wordStart,
                    _diag[row - 1][column - 1] === 0,
                    hasStrongFirstMatch,
                );
            }

            let diagScore = 0;
            if (score !== Number.MIN_SAFE_INTEGER) {
                canComeDiag = true;
                diagScore = score + _table[row - 1][column - 1];
            }

            const canComeLeft = wordPos > minWordMatchPos;
            const leftScore = canComeLeft ? _table[row][column - 1] + (_diag[row][column - 1] > 0 ? -5 : 0) : 0;

            const canComeLeftLeft = wordPos > minWordMatchPos + 1 && _diag[row][column - 1] > 0;
            const leftLeftScore = canComeLeftLeft ? _table[row][column - 2] + (_diag[row][column - 2] > 0 ? -5 : 0) : 0;

            if (canComeLeftLeft && (!canComeLeft || leftLeftScore >= leftScore) && (!canComeDiag || leftLeftScore >= diagScore)) {
                _table[row][column] = leftLeftScore;
                _arrows[row][column] = Arrow_LeftLeft;
                _diag[row][column] = 0;
            } else if (canComeLeft && (!canComeDiag || leftScore >= diagScore)) {
                _table[row][column] = leftScore;
                _arrows[row][column] = Arrow_Left;
                _diag[row][column] = 0;
            } else if (canComeDiag) {
                _table[row][column] = diagScore;
                _arrows[row][column] = Arrow_Diag;
                _diag[row][column] = _diag[row - 1][column - 1] + 1;
            } else {
                throw new Error(`not possible`);
            }
        }
    }

    if (!hasStrongFirstMatch[0] && !options.firstMatchCanBeWeak) {
        return undefined;
    }

    row--;
    column--;

    const result = [_table[row][column], wordStart];

    let backwardsDiagLength = 0;
    let maxMatchColumn = 0;

    while (row >= 1) {
        let diagColumn = column;
        do {
            const arrow = _arrows[row][diagColumn];
            if (arrow === Arrow_LeftLeft) {
                diagColumn = diagColumn - 2;
            } else if (arrow === Arrow_Left) {
                diagColumn = diagColumn - 1;
            } else {
                break;
            }
        } while (diagColumn >= 1);

        if (
            backwardsDiagLength > 1 &&
            patternLow[patternStart + row - 1] === wordLow[wordStart + column - 1] &&
            !isUpperCaseAtPos(diagColumn + wordStart - 1, word, wordLow) &&
            backwardsDiagLength + 1 > _diag[row][diagColumn]
        ) {
            diagColumn = column;
        }

        if (diagColumn === column) {
            backwardsDiagLength++;
        } else {
            backwardsDiagLength = 1;
        }

        if (!maxMatchColumn) {
            maxMatchColumn = diagColumn;
        }

        row--;
        column = diagColumn - 1;
        result.push(column);
    }

    if (wordLen - wordStart === patternLen && options.boostFullMatch) {
        result[0] += 2;
    }

    const skippedCharsCount = maxMatchColumn - patternLen;
    result[0] -= skippedCharsCount;

    return result;
}

// endregion
