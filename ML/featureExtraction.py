import re
import random
class features:
    def analyze_string(self, s):
        counts = []
        # Data
        value = random.randint(0, 1)
        counts.append(value)
        # Singlequotes
        counts.append(s.count("'"))
        # Doublequotes
        counts.append(s.count('"'))
        # Punctuations
        counts.append(len(re.findall(r'[.,;:!?]', s)))
        # 1-line comments
        counts.append(len(re.findall(r'//.*|#.*', s)))
        # Multi-line comments
        counts.append(len(re.findall(r'/\*[\s\S]*?\*/', s)))
        # Spaces
        counts.append(s.count(' '))
        # Safe keywords
        counts.append(len(re.findall(r'\bSELECT\b|\bFROM\b|\bWHERE\b|\bAND\b|\bOR\b', s, re.IGNORECASE)))
        # Harmful keywords
        counts.append(len(re.findall(r'\bDROP\b|\bDELETE\b|\bTRUNCATE\b|\bALTER\b', s, re.IGNORECASE)))
        # Percentages
        counts.append(s.count('%'))
        # Logical operators
        counts.append(len(re.findall(r'&&|\|\||!', s)))
        # Operators
        counts.append(len(re.findall(r'[+\-*/=<>]', s)))
        # Nulls
        counts.append(len(re.findall(r'\bNULL\b', s, re.IGNORECASE)))
        # Hexadecimal numbers
        counts.append(len(re.findall(r'0x[0-9A-Fa-f]+', s)))
        # Database info
        counts.append(len(re.findall(r'\bDB_NAME\b|\bDATABASE\b|\bSCHEMA\b', s, re.IGNORECASE)))
        # Roles
        counts.append(len(re.findall(r'\bADMIN\b|\bUSER\b|\bGUEST\b|\bROOT\b', s, re.IGNORECASE)))
        # Network commands
        counts.append(len(re.findall(r'\bPING\b|\bIPCONFIG\b|\bNETSTAT\b', s, re.IGNORECASE)))
        # Language commands
        counts.append(len(re.findall(r'\bprint\b|\bif\b|\belse\b|\bfor\b|\bwhile\b|\bdef\b', s)))
        # Alphabets
        counts.append(len(re.findall(r'[A-Za-z]', s)))
        # Digits
        counts.append(len(re.findall(r'\d', s)))
        # Special characters
        counts.append(len(re.findall(r'[^A-Za-z0-9\s]', s)))

        return counts

