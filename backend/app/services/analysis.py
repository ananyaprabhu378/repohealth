import os
from radon.complexity import cc_visit
from radon.metrics import h_visit, mi_visit

class AnalysisService:
    def __init__(self):
        pass

    def analyze_python_file(self, file_path: str):
        """
        Analyzes a single python file for complexity.
        Returns average cyclomatic complexity and maintainability index.
        """
        if not os.path.exists(file_path):
            return None

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                code = f.read()

            # Cyclomatic Complexity
            blocks = cc_visit(code)
            total_cc = sum(block.complexity for block in blocks)
            avg_cc = total_cc / len(blocks) if blocks else 0

            # Maintainability Index
            mi = mi_visit(code, multi=False)

            return {
                "complexity": avg_cc,
                "maintainability": mi
            }
        except Exception as e:
            # Handle parsing errors, empty files, etc.
            return None
