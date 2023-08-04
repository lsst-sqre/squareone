import nox

# Default sessions
nox.options.sessions = ["docs"]

# Other nox defaults
nox.options.default_venv_backend = "venv"
nox.options.reuse_existing_virtualenvs = True

PIP_DEPENDENCIES = [
    ("--upgrade", "pip"),
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
    session.run(
        python, "-m", "pip", "install", "nox", external=True
    )


@nox.session(name="venv-init")
def init_dev(session: nox.Session) -> None:
    """Set up a documentation venv."""
    # Create a venv in the current directory, replacing any existing one
    session.run("python", "-m", "venv", ".venv", "--clear")
    _install(session, bin_prefix=".venv/bin/")

    print(
        "\nTo activate this virtual env, run:\n\n\tsource .venv/bin/activate\n"
    )


@nox.session(name="init", python=False)
def init(session: nox.Session) -> None:
    """Set up the documentation environment in the current virtual env."""
    _install(session, bin_prefix="")


@nox.session
def docs(session: nox.Session) -> None:
    """Build the docs."""
    _install(session)
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
    _install(session)
    doctree_dir = (session.cache_dir / "doctrees").absolute()
    with session.chdir("docs"):
        session.run(
            "sphinx-build",
            "-W",
            "--keep-going",
            "-n",
            "-T",
            "-b" "linkcheck",
            "-d",
            str(doctree_dir),
            ".",
            "./_build/html",
        )
