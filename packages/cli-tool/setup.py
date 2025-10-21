from setuptools import setup, find_packages

setup(
    name="monorepo-cli",
    version="1.0.0",
    description="Claude Code デモ - CLIツール",
    packages=find_packages(),
    python_requires=">=3.8",
    install_requires=[
        "requests>=2.31.0",
        "click>=8.1.0",
    ],
    entry_points={
        "console_scripts": [
            "monorepo-cli=src.main:cli",
        ],
    },
)
