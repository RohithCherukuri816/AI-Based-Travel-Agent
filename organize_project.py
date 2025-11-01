#!/usr/bin/env python3
"""
AI Travel Agent - Project Organization Script
Automatically organizes and cleans up the project structure
"""

import os
import shutil
import subprocess
import sys
from pathlib import Path

def print_banner():
    """Print organization banner"""
    print("""
    ╔══════════════════════════════════════════════════════════════╗
    ║                 🧹 AI Travel Agent Cleanup                   ║
    ║                   Project Organization                       ║
    ╚══════════════════════════════════════════════════════════════╝
    """)

def remove_cache_files():
    """Remove Python cache files and directories"""
    print("🗑️  Removing Python cache files...")
    
    # Remove __pycache__ directories
    for root, dirs, files in os.walk('.'):
        for dir_name in dirs[:]:  # Use slice to avoid modification during iteration
            if dir_name == '__pycache__':
                cache_path = os.path.join(root, dir_name)
                print(f"   Removing: {cache_path}")
                shutil.rmtree(cache_path, ignore_errors=True)
                dirs.remove(dir_name)
    
    # Remove .pyc files
    for root, dirs, files in os.walk('.'):
        for file_name in files:
            if file_name.endswith('.pyc'):
                pyc_path = os.path.join(root, file_name)
                print(f"   Removing: {pyc_path}")
                os.remove(pyc_path)
    
    print("✅ Python cache cleanup complete")

def remove_build_artifacts():
    """Remove build artifacts and temporary files"""
    print("🗑️  Removing build artifacts...")
    
    artifacts = [
        'frontend/build',
        'frontend/node_modules',
        'myenv',
        'venv',
        '.pytest_cache',
        'htmlcov',
        '*.egg-info'
    ]
    
    for artifact in artifacts:
        if os.path.exists(artifact):
            print(f"   Removing: {artifact}")
            if os.path.isdir(artifact):
                shutil.rmtree(artifact, ignore_errors=True)
            else:
                os.remove(artifact)
    
    print("✅ Build artifacts cleanup complete")

def create_directory_structure():
    """Create organized directory structure"""
    print("📁 Creating organized directory structure...")
    
    directories = [
        'backend',
        'backend/core',
        'backend/api',
        'backend/services',
        'backend/models',
        'backend/utils',
        'tests',
        'tests/backend',
        'tests/frontend',
        'docs',
        'scripts',
        'config'
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"   Created: {directory}/")
    
    print("✅ Directory structure created")

def organize_backend_files():
    """Organize backend files into proper structure"""
    print("🔧 Organizing backend files...")
    
    # Core application files
    core_files = {
        'app.py': 'backend/core/',
        'main.py': 'backend/core/',
        'database.py': 'backend/core/',
        'models.py': 'backend/models/',
    }
    
    # API and service files
    service_files = {
        'ai_chat.py': 'backend/services/',
        'analytics_dashboard.py': 'backend/services/',
        'payment_system.py': 'backend/services/',
        'real_api_config.py': 'backend/services/',
    }
    
    # Utility files
    utility_files = {
        'start.py': 'scripts/',
    }
    
    # Move files
    all_files = {**core_files, **service_files, **utility_files}
    
    for source, destination in all_files.items():
        if os.path.exists(source):
            dest_path = os.path.join(destination, source)
            print(f"   Moving: {source} -> {dest_path}")
            # Create destination directory if it doesn't exist
            os.makedirs(destination, exist_ok=True)
            shutil.move(source, dest_path)
    
    print("✅ Backend files organized")

def create_init_files():
    """Create __init__.py files for Python packages"""
    print("📝 Creating __init__.py files...")
    
    init_dirs = [
        'backend',
        'backend/core',
        'backend/api',
        'backend/services',
        'backend/models',
        'backend/utils',
    ]
    
    for directory in init_dirs:
        init_file = os.path.join(directory, '__init__.py')
        if not os.path.exists(init_file):
            with open(init_file, 'w') as f:
                f.write(f'"""AI Travel Agent - {directory.replace("/", ".")} package"""\n')
            print(f"   Created: {init_file}")
    
    print("✅ __init__.py files created")

def update_imports():
    """Update import statements in moved files"""
    print("🔄 Updating import statements...")
    
    # This would require more complex logic to update all imports
    # For now, we'll create a note file
    with open('UPDATE_IMPORTS.md', 'w') as f:
        f.write("""# Import Updates Required

After reorganizing the project structure, you'll need to update import statements in the following files:

## Files that need import updates:
- `backend/core/app.py` - Update imports for models, services
- `backend/core/main.py` - Update imports for ai_chat, models
- `backend/services/*.py` - Update imports for models, database

## Example updates:
```python
# Old import
from models import User, Trip

# New import
from backend.models.models import User, Trip
```

## Recommended approach:
1. Use an IDE with refactoring support (PyCharm, VSCode)
2. Use find-and-replace for common import patterns
3. Test imports after each change
""")
    
    print("✅ Import update guide created")

def create_project_summary():
    """Create a project summary file"""
    print("📊 Creating project summary...")
    
    summary = """# 🎯 AI Travel Agent - Project Summary

## 📁 Organized Structure

```
AI-Travel-Agent/
├── 📁 backend/                   # Backend application
│   ├── core/                     # Core application files
│   │   ├── app.py               # Main FastAPI application
│   │   ├── main.py              # Alternative entry point
│   │   └── database.py          # Database configuration
│   ├── models/                   # Database models
│   │   └── models.py            # SQLAlchemy models
│   ├── services/                 # Business logic services
│   │   ├── ai_chat.py           # AI chat service
│   │   ├── analytics_dashboard.py # Analytics service
│   │   ├── payment_system.py    # Payment service
│   │   └── real_api_config.py   # API integration service
│   └── utils/                    # Utility functions
├── 📁 frontend/                  # React frontend
│   ├── src/
│   │   ├── components/          # React components
│   │   └── services/            # API services
│   └── package.json
├── 📁 data/                      # Mock data files
├── 📁 tests/                     # Test files
├── 📁 docs/                      # Documentation
├── 📁 scripts/                   # Utility scripts
│   └── start.py                 # Application startup
├── 📁 config/                    # Configuration files
├── .env                         # Environment variables
├── requirements.txt             # Python dependencies
└── README.md                    # Main documentation
```

## 🚀 Quick Start

1. **Install Dependencies:**
   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   cd frontend && npm install
   ```

2. **Start Application:**
   ```bash
   python scripts/start.py
   ```

3. **Access Application:**
   - Frontend: http://localhost:8001
   - Backend: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## ✅ Cleanup Complete

Your AI Travel Agent codebase is now clean and organized!
"""
    
    with open('PROJECT_SUMMARY.md', 'w') as f:
        f.write(summary)
    
    print("✅ Project summary created")

def main():
    """Main organization function"""
    print_banner()
    
    try:
        # Step 1: Remove cache and build artifacts
        remove_cache_files()
        remove_build_artifacts()
        
        # Step 2: Create organized directory structure
        create_directory_structure()
        
        # Step 3: Organize backend files
        organize_backend_files()
        
        # Step 4: Create __init__.py files
        create_init_files()
        
        # Step 5: Update imports (create guide)
        update_imports()
        
        # Step 6: Create project summary
        create_project_summary()
        
        print("\n🎉 Project organization complete!")
        print("\n📋 Next steps:")
        print("1. Review UPDATE_IMPORTS.md for import statement updates")
        print("2. Test the application: python scripts/start.py")
        print("3. Update any remaining import statements")
        print("4. Commit your organized codebase")
        
    except Exception as e:
        print(f"❌ Error during organization: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()