import re
from app.services.parser import ASTParser

class LanguageParserService:
    def __init__(self):
        try:
            self.ast_parser = ASTParser()
        except Exception:
            self.ast_parser = None

    def extract_imports(self, file_path: str, content: str) -> list[str]:
        """
        Resilient dynamic import extraction for JS, TS, Python, Go, Java, C++, and Rust.
        Uses AST parser where available, otherwise falls back to robust regex matching.
        """
        if not content:
            return []

        ext = file_path.split(".")[-1].lower() if "." in file_path else ""

        # Python
        if ext == "py":
            if self.ast_parser:
                try:
                    return self.ast_parser.extract_imports_python(content.encode("utf-8"))
                except Exception:
                    pass
            # Fallback regex
            imports = re.findall(r"^\s*(?:import|from)\s+([a-zA-Z0-9_\.]+)", content, re.MULTILINE)
            return list(set(imports))

        # JS / TS
        elif ext in ["js", "ts", "jsx", "tsx"]:
            if self.ast_parser and ext == "js":
                try:
                    return self.ast_parser.extract_imports_js(content.encode("utf-8"))
                except Exception:
                    pass
            # Fallback regex for ES6 & CommonJS imports
            es6 = re.findall(r"import\s+.*?\s+from\s+['\"](.*?)['\"]", content)
            commonjs = re.findall(r"require\(['\"](.*?)['\"]\)", content)
            return list(set(es6 + commonjs))

        # Go
        elif ext == "go":
            # Matches import "path/to/pkg" or import ( ... )
            single = re.findall(r"import\s+['\"](.*?)['\"]", content)
            multi = re.findall(r"import\s*\((.*?)\)", content, re.DOTALL)
            pkgs = []
            if multi:
                for block in multi:
                    pkgs.extend(re.findall(r"['\"](.*?)['\"]", block))
            return list(set(single + pkgs))

        # Java
        elif ext == "java":
            imports = re.findall(r"^\s*import\s+([a-zA-Z0-9_\.]+);", content, re.MULTILINE)
            return list(set(imports))

        # C++
        elif ext in ["cpp", "h", "hpp", "cc"]:
            imports = re.findall(r"^\s*#include\s+['\"<](.*?)[>\'\"]", content, re.MULTILINE)
            return list(set(imports))

        # Rust
        elif ext == "rs":
            imports = re.findall(r"^\s*use\s+([a-zA-Z0-9_\:\*\{\}]+);", content, re.MULTILINE)
            return list(set(imports))

        return []
