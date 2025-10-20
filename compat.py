import subprocess
import sys
import os
from importlib.metadata import version as get_version, PackageNotFoundError


# Detecta se há um ambiente virtual na pasta atual
def detect_venv_python():
    venv_path = os.path.join(os.getcwd(), ".venv", "Scripts", "python.exe")
    if os.path.exists(venv_path):
        return venv_path
    return sys.executable  # Fallback para o Python atual (global ou outro venv)


PYTHON_EXEC = detect_venv_python()


def get_installed_version(package):
    try:
        return get_version(package)
    except PackageNotFoundError as e:
        print(e)
        return None


def uninstall_package(package):
    try:
        print(f"[ESP DEP]Uninstalling {package}...")
        subprocess.check_call([PYTHON_EXEC, "-m", "pip", "uninstall", "-y", package])
    except subprocess.CalledProcessError as e:
        print(f"[ESP DEP]Failed to uninstall {package}. Error: {e}")


def install_package(package, version):
    try:
        print(f"[ESP DEP]Installing {package} version {version}...")
        subprocess.check_call([PYTHON_EXEC, "-m", "pip", "install", f"{package}=={version}"])
    except subprocess.CalledProcessError as e:
        print(f"[ESP DEP]Failed to install {package} version {version}. Error: {e}")


def check_and_fix_package(package, module, expected_version):
    installed_version = get_installed_version(package)

    if installed_version:
        print(f"[ESP DEP]{package} is installed with version {installed_version}.")
        if installed_version != expected_version:
            print(f"[ESP DEP]Version mismatch! Expected: {expected_version}, Installed: {installed_version}.")
            uninstall_package(package)
            install_package(package, expected_version)
        else:
            print(f"[ESP DEP]{package} is already at the expected version ({expected_version}).")
    else:
        print(f"[ESP DEP]{package} is not installed.")
        install_package(package, expected_version)


packages = {
    "esptool": ("esptool", "4.10")
}

# Check and fix packages
for package, (module, expected_version) in packages.items():
    check_and_fix_package(package, module, expected_version)

print("[ESP DEP]Package version check and update completed.")
