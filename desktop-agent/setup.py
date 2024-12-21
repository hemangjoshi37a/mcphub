from setuptools import setup, find_packages

setup(
    name="mcphub-agent",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "fastapi>=0.68.0",
        "uvicorn>=0.15.0",
        "pydantic>=1.8.0",
        "python-dotenv>=0.19.0",
        "requests>=2.26.0",
        "typing-extensions>=4.0.0"
    ],
    entry_points={
        'console_scripts': [
            'mcphub-agent=src.main:main',
        ],
    },
)