# /// script
# requires-python = ">=3.13"
# dependencies = ["nox"]
# ///

import nox

# Default sessions
nox.options.sessions = ["docs"]

# Other nox defaults
nox.options.default_venv_backend = "uv"
nox.options.reuse_existing_virtualenvs = True

PIP_DEPENDENCIES = [
    ("-r", "docs/requirements.txt"),
]


def _install(session: nox.Session, bin_prefix: str = "") -> None:
    """Install the application and all development dependencies into the
    session.
    """
    python = f"{bin_prefix}python"

    # Install dev dependencies
    for deps in PIP_DEPENDENCIES:
        session.run(python, "-m", "pip", "install", *deps, external=True)
    session.run(python, "-m", "pip", "install", "nox", external=True)


@nox.session
def docs(session: nox.Session) -> None:
    """Build the docs."""
    session.install("-r", "docs/requirements.txt")
    doctree_dir = (session.cache_dir / "doctrees").absolute()
    with session.chdir("docs"):
        session.run(
            "sphinx-build",
            "-W",
            "--keep-going",
            "-n",
            "-T",
            "-b",
            "html",
            "-d",
            str(doctree_dir),
            ".",
            "./_build/html",
        )


@nox.session(name="docs-linkcheck")
def docs_linkcheck(session: nox.Session) -> None:
    """Linkcheck the docs."""
    session.install("-r", "docs/requirements.txt")
    doctree_dir = (session.cache_dir / "doctrees").absolute()
    with session.chdir("docs"):
        session.run(
            "sphinx-build",
            "-W",
            "--keep-going",
            "-n",
            "-T",
            "-blinkcheck",
            "-d",
            str(doctree_dir),
            ".",
            "./_build/html",
        )


if __name__ == "__main__":
    # For running standalone with `uv run noxfile.py`.
    nox.main()
