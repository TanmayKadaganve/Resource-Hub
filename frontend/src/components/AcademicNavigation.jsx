
function AcademicNavigation({
  scheme,
  branch,
  semester,
  subject,
  module,
  branches,
  curriculum,
  semesters,
  subjects,
  openBranch,
  goToSubjects,
  goToModules,
  openModule,
  resetToBranches,
  renderBackButton,
  setSemester,
  setModule,
}) {
  // Screen 1: Branch selection
  if (!branch) {
    return (
      <section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">EXPLORE CURRICULUM</p>
            <h2>Select your academic path</h2>
            <p>Choose your branch to continue.</p>
          </div>
        </div>

        <div className="card-grid">
          {branches
            .filter((name) => curriculum[scheme]?.[name])
            .map((name) => (
              <button
                className="academic-card branch-card"
                key={name}
                onClick={() => openBranch(name)}
              >
                <span className="card-topline">
                  <span className="card-icon">▤</span>
                  <span className="scheme-tag">
                    {scheme} Scheme
                  </span>
                </span>

                <h3>{name}</h3>

                <p>
                  {name === "First Year"
                    ? "Common first-year subjects"
                    : `${name} academic resources`}
                </p>

                <span className="card-action">
                  Explore →
                </span>
              </button>
            ))}
        </div>
      </section>
    );
  }

  // Screen 2: Semester selection
  if (!semester) {
    return (
      <section>
        {renderBackButton(
          "All Branches",
          () => resetToBranches()
        )}

        <div className="section-heading">
          <div>
            <p className="eyebrow">{scheme} SCHEME</p>
            <h2>{branch}</h2>
            <p>Select a semester to continue.</p>
          </div>
        </div>

        <div className="card-grid">
          {semesters.map((value) => (
            <button
              className="academic-card"
              key={value}
              onClick={() => goToSubjects(value)}
            >
              <span className="card-icon">▣</span>

              <h3>Semester {value}</h3>

              <p>
                {Number(value) <= 2
                  ? "First-year curriculum"
                  : `Year ${Math.ceil(Number(value) / 2)}`}
              </p>

              <span className="card-action">
                View Subjects →
              </span>
            </button>
          ))}
        </div>
      </section>
    );
  }

  // Screen 3: Subject selection
  if (!subject) {
    return (
      <section>
        {renderBackButton("Semesters", () => {
          setSemester(null);
          setModule(null);
        })}

        <div className="section-heading">
          <div>
            <p className="eyebrow">
              SEMESTER {semester}
            </p>

            <h2>Subjects</h2>

            <p>Select a subject.</p>
          </div>
        </div>

        <div className="card-grid">
          {subjects.map((item) => (
            <button
              className="academic-card subject-card"
              key={item.name}
              onClick={() => goToModules(item)}
            >
              <span className="card-topline">
                <span className="semester-tag">
                  Sem {semester}
                </span>

                <span className="subject-code">
                  {item.code || "Subject"}
                </span>
              </span>

              <h3>{item.name}</h3>

              <span className="card-action">
                View Modules →
              </span>
            </button>
          ))}
        </div>
      </section>
    );
  }

  // Screen 4: Module selection
  if (!module) {
    return (
      <section>
        {renderBackButton(
          "Subjects",
          () => goToModules(null)
        )}

        <div className="section-heading">
          <div>
            <p className="eyebrow">
              {subject.name}
            </p>

            <h2>Subject Modules</h2>

            <p>Choose a module.</p>
          </div>
        </div>

        <div className="module-list">
          {subject.modules.map((item) => (
            <button
              className="module-row"
              key={item.number}
              onClick={() => openModule(item)}
            >
              <span className="module-number">
                {String(item.number).padStart(2, "0")}
              </span>

              <span className="module-copy">
                <strong>{item.title}</strong>

              </span>

              <span className="module-arrow">
                →
              </span>
            </button>
          ))}
        </div>
      </section>
    );
  }

  return null;
}

export default AcademicNavigation;
