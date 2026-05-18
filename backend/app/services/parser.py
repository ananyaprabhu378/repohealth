from tree_sitter import Language, Parser
import tree_sitter_python
import tree_sitter_javascript
import tree_sitter_typescript

class ASTParser:
    def __init__(self):
        self.py_lang = Language(tree_sitter_python.language(), "python")
        self.js_lang = Language(tree_sitter_javascript.language(), "javascript")
        self.ts_lang = Language(tree_sitter_typescript.language_typescript(), "typescript")
        
        self.py_parser = Parser()
        self.py_parser.set_language(self.py_lang)
        
        self.js_parser = Parser()
        self.js_parser.set_language(self.js_lang)
        
        self.ts_parser = Parser()
        self.ts_parser.set_language(self.ts_lang)

    def extract_imports_python(self, code: bytes) -> list[str]:
        tree = self.py_parser.parse(code)
        
        query = self.py_lang.query(
            """
            (import_statement name: (dotted_name) @import)
            (import_from_statement module_name: (dotted_name) @import)
            """
        )
        
        captures = query.captures(tree.root_node)
        imports = [node.text.decode('utf-8') for node, _ in captures]
        return list(set(imports))

    def extract_imports_js(self, code: bytes) -> list[str]:
        tree = self.js_parser.parse(code)
        
        query = self.js_lang.query(
            """
            (import_statement source: (string) @import)
            (call_expression
                function: (identifier) @func
                arguments: (arguments (string) @import)
                (#eq? @func "require"))
            """
        )
        
        captures = query.captures(tree.root_node)
        imports = [node.text.decode('utf-8').strip('"\'') for node, tag in captures if tag == "import"]
        return list(set(imports))
