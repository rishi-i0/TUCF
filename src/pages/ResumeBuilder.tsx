import React, { useMemo, useState } from "react";
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  FolderGit2,
  GraduationCap,
  Target,
  User,
  Wrench,
} from "lucide-react";
import "./ResumeBuilder.css";

type ResumeSection =
  | "personal"
  | "summary"
  | "skills"
  | "experience"
  | "projects"
  | "education"
  | "export";

interface ExperienceItem {
  company: string;
  location: string;
  title: string;
  startDate: string;
  endDate: string;
  bullets: string;
}

interface ProjectItem {
  title: string;
  githubUrl: string;
  techStack: string;
  dateRange: string;
  bullets: string;
}

interface ResumeData {
  fullName: string;
  jobTitle: string;
  phone: string;
  email: string;
  linkedin: string;
  github: string;
  location: string;
  summary: string;
  skillsLanguages: string;
  skillsBackend: string;
  skillsDatabases: string;
  skillsTools: string;
  experience: ExperienceItem[];
  projects: ProjectItem[];
  college: string;
  eduLocation: string;
  degree: string;
  eduStart: string;
  eduEnd: string;
  cgpa: string;
}

const sections: {
  id: ResumeSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "personal", label: "Personal Info", icon: User },
  { id: "summary", label: "Summary", icon: Target },
  { id: "skills", label: "Technical Skills", icon: Wrench },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "projects", label: "Projects", icon: FolderGit2 },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "export", label: "Export", icon: Download },
];

const createEmptyExperience = (): ExperienceItem => ({
  company: "",
  location: "",
  title: "",
  startDate: "",
  endDate: "",
  bullets: "",
});

const createEmptyProject = (): ProjectItem => ({
  title: "",
  githubUrl: "",
  techStack: "",
  dateRange: "",
  bullets: "",
});

const initialData: ResumeData = {
  fullName: "Winster Mano",
  jobTitle: "Software Developer",
  phone: "+91 8610913767",
  email: "winster@example.com",
  linkedin: "https://linkedin.com/in/winstermano",
  github: "https://github.com/winstermano",
  location: "Chennai, TN, India",
  summary:
    "ATS-focused software developer with experience building backend systems, REST APIs, and full-stack applications using modern tools and clean engineering practices.",
  skillsLanguages: "Java 17+, SQL, JavaScript",
  skillsBackend: "Spring Boot, REST API, React.js",
  skillsDatabases: "MySQL, MongoDB",
  skillsTools: "Git, Postman, Maven, Docker",
  experience: [
    {
      company: "CareerPro",
      location: "Chennai",
      title: "Software Developer",
      startDate: "Jan 2025",
      endDate: "Present",
      bullets:
        "Built modular LMS features for ATS scoring and portfolio generation.\nDesigned API integrations and optimized frontend flows for student career tools.",
    },
  ],
  projects: [
    {
      title: "ATS Resume Score Checker",
      githubUrl: "https://github.com/winstermano/ats-checker",
      techStack: "React, Node.js, Express",
      dateRange: "Jan 2025 -- Mar 2025",
      bullets:
        "Implemented resume parsing, keyword scoring, and actionable suggestions.\nImproved user workflow with live preview and modular dashboard integration.",
    },
  ],
  college: "Meenakshi College of Engineering",
  eduLocation: "Chennai",
  degree: "Bachelor of Technology (B.Tech) in Information Technology",
  eduStart: "2022",
  eduEnd: "2026",
  cgpa: "7.5 / 10",
};

const ResumeBuilder: React.FC = () => {
  const [activeSection, setActiveSection] = useState<ResumeSection>("personal");
  const [data, setData] = useState<ResumeData>(initialData);
  const [copyStatus, setCopyStatus] = useState("");

  const currentSectionIndex = sections.findIndex(
    (section) => section.id === activeSection,
  );

  const previewText = useMemo(
    () => `${data.fullName}\n${data.jobTitle}\n${data.email}\n${data.phone}`,
    [data.fullName, data.jobTitle, data.email, data.phone],
  );

  const updateField = <K extends keyof ResumeData>(
    field: K,
    value: ResumeData[K],
  ) => {
    setData((previous) => ({ ...previous, [field]: value }));
  };

  const updateExperience = (
    index: number,
    field: keyof ExperienceItem,
    value: string,
  ) => {
    setData((previous) => ({
      ...previous,
      experience: previous.experience.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const updateProject = (
    index: number,
    field: keyof ProjectItem,
    value: string,
  ) => {
    setData((previous) => ({
      ...previous,
      projects: previous.projects.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const addExperience = () => {
    setData((previous) => ({
      ...previous,
      experience: [...previous.experience, createEmptyExperience()],
    }));
  };

  const addProject = () => {
    setData((previous) => ({
      ...previous,
      projects: [...previous.projects, createEmptyProject()],
    }));
  };

  const copyPreview = async () => {
    try {
      await navigator.clipboard.writeText(previewText);
      setCopyStatus("Copied to clipboard");
    } catch {
      setCopyStatus("Copy failed");
    } finally {
      window.setTimeout(() => setCopyStatus(""), 2000);
    }
  };

  const exportResume = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "resume-data.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="resume-builder-page">
      <div className="resume-builder-shell">
        <aside className="resume-builder-navpanel">
          <div className="resume-builder-brand">
            <h2>Resume Builder</h2>
            <p>Clean, fast, ATS-friendly</p>
          </div>

          <div className="resume-builder-navlist">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = section.id === activeSection;

              return (
                <button
                  key={section.id}
                  type="button"
                  className={`resume-builder-navbtn ${isActive ? "is-active" : ""}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <Icon className="h-4 w-4" />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="resume-builder-formpanel">
          <div className="resume-builder-panelhead">
            <h1>Build your resume</h1>
            <p>
              Section {currentSectionIndex + 1} of {sections.length}
            </p>
          </div>

          {activeSection === "personal" && (
            <section className="resume-builder-sectioncard resume-builder-section">
              <h3>Personal Information</h3>
              <div className="resume-builder-grid">
                <label className="resume-builder-field">
                  <span>Full Name</span>
                  <input
                    value={data.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                  />
                </label>
                <label className="resume-builder-field">
                  <span>Job Title</span>
                  <input
                    value={data.jobTitle}
                    onChange={(e) => updateField("jobTitle", e.target.value)}
                  />
                </label>
                <label className="resume-builder-field">
                  <span>Phone</span>
                  <input
                    value={data.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                </label>
                <label className="resume-builder-field">
                  <span>Email</span>
                  <input
                    value={data.email}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                </label>
                <label className="resume-builder-field">
                  <span>LinkedIn</span>
                  <input
                    value={data.linkedin}
                    onChange={(e) => updateField("linkedin", e.target.value)}
                  />
                </label>
                <label className="resume-builder-field">
                  <span>GitHub</span>
                  <input
                    value={data.github}
                    onChange={(e) => updateField("github", e.target.value)}
                  />
                </label>
                <label className="resume-builder-field resume-builder-field-full">
                  <span>Location</span>
                  <input
                    value={data.location}
                    onChange={(e) => updateField("location", e.target.value)}
                  />
                </label>
              </div>
            </section>
          )}

          {activeSection === "summary" && (
            <section className="resume-builder-sectioncard resume-builder-section">
              <h3>Professional Summary</h3>
              <label className="resume-builder-field">
                <span>Summary</span>
                <textarea
                  value={data.summary}
                  onChange={(e) => updateField("summary", e.target.value)}
                />
              </label>
            </section>
          )}

          {activeSection === "skills" && (
            <section className="resume-builder-sectioncard resume-builder-section">
              <h3>Technical Skills</h3>
              <div className="resume-builder-grid">
                <label className="resume-builder-field">
                  <span>Languages / Core</span>
                  <input
                    value={data.skillsLanguages}
                    onChange={(e) =>
                      updateField("skillsLanguages", e.target.value)
                    }
                  />
                </label>
                <label className="resume-builder-field">
                  <span>Backend / Frameworks</span>
                  <input
                    value={data.skillsBackend}
                    onChange={(e) =>
                      updateField("skillsBackend", e.target.value)
                    }
                  />
                </label>
                <label className="resume-builder-field">
                  <span>Databases</span>
                  <input
                    value={data.skillsDatabases}
                    onChange={(e) =>
                      updateField("skillsDatabases", e.target.value)
                    }
                  />
                </label>
                <label className="resume-builder-field">
                  <span>Tools / Practices</span>
                  <input
                    value={data.skillsTools}
                    onChange={(e) => updateField("skillsTools", e.target.value)}
                  />
                </label>
              </div>
            </section>
          )}

          {activeSection === "experience" && (
            <section className="resume-builder-sectioncard resume-builder-section">
              <div className="resume-builder-sectiontop">
                <h3>Experience</h3>
                <button
                  type="button"
                  className="resume-builder-accentbtn"
                  onClick={addExperience}
                >
                  Add Experience
                </button>
              </div>

              <div className="resume-builder-stack">
                {data.experience.map((item, index) => (
                  <div
                    key={`${item.company}-${index}`}
                    className="resume-builder-block"
                  >
                    <div className="resume-builder-grid">
                      <label className="resume-builder-field">
                        <span>Company</span>
                        <input
                          value={item.company}
                          onChange={(e) =>
                            updateExperience(index, "company", e.target.value)
                          }
                        />
                      </label>
                      <label className="resume-builder-field">
                        <span>Location</span>
                        <input
                          value={item.location}
                          onChange={(e) =>
                            updateExperience(index, "location", e.target.value)
                          }
                        />
                      </label>
                      <label className="resume-builder-field">
                        <span>Title</span>
                        <input
                          value={item.title}
                          onChange={(e) =>
                            updateExperience(index, "title", e.target.value)
                          }
                        />
                      </label>
                      <label className="resume-builder-field">
                        <span>Dates</span>
                        <input
                          value={`${item.startDate} - ${item.endDate}`}
                          readOnly
                        />
                      </label>
                    </div>
                    <label className="resume-builder-field">
                      <span>Bullets</span>
                      <textarea
                        value={item.bullets}
                        onChange={(e) =>
                          updateExperience(index, "bullets", e.target.value)
                        }
                      />
                    </label>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeSection === "projects" && (
            <section className="resume-builder-sectioncard resume-builder-section">
              <div className="resume-builder-sectiontop">
                <h3>Projects</h3>
                <button
                  type="button"
                  className="resume-builder-accentbtn"
                  onClick={addProject}
                >
                  Add Project
                </button>
              </div>

              <div className="resume-builder-stack">
                {data.projects.map((item, index) => (
                  <div
                    key={`${item.title}-${index}`}
                    className="resume-builder-block"
                  >
                    <div className="resume-builder-grid">
                      <label className="resume-builder-field">
                        <span>Title</span>
                        <input
                          value={item.title}
                          onChange={(e) =>
                            updateProject(index, "title", e.target.value)
                          }
                        />
                      </label>
                      <label className="resume-builder-field">
                        <span>GitHub URL</span>
                        <input
                          value={item.githubUrl}
                          onChange={(e) =>
                            updateProject(index, "githubUrl", e.target.value)
                          }
                        />
                      </label>
                      <label className="resume-builder-field">
                        <span>Tech Stack</span>
                        <input
                          value={item.techStack}
                          onChange={(e) =>
                            updateProject(index, "techStack", e.target.value)
                          }
                        />
                      </label>
                      <label className="resume-builder-field">
                        <span>Date Range</span>
                        <input
                          value={item.dateRange}
                          onChange={(e) =>
                            updateProject(index, "dateRange", e.target.value)
                          }
                        />
                      </label>
                    </div>
                    <label className="resume-builder-field">
                      <span>Bullets</span>
                      <textarea
                        value={item.bullets}
                        onChange={(e) =>
                          updateProject(index, "bullets", e.target.value)
                        }
                      />
                    </label>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeSection === "education" && (
            <section className="resume-builder-sectioncard resume-builder-section">
              <h3>Education</h3>
              <div className="resume-builder-grid">
                <label className="resume-builder-field">
                  <span>College</span>
                  <input
                    value={data.college}
                    onChange={(e) => updateField("college", e.target.value)}
                  />
                </label>
                <label className="resume-builder-field">
                  <span>Location</span>
                  <input
                    value={data.eduLocation}
                    onChange={(e) => updateField("eduLocation", e.target.value)}
                  />
                </label>
                <label className="resume-builder-field resume-builder-field-full">
                  <span>Degree</span>
                  <input
                    value={data.degree}
                    onChange={(e) => updateField("degree", e.target.value)}
                  />
                </label>
                <label className="resume-builder-field">
                  <span>Start Year</span>
                  <input
                    value={data.eduStart}
                    onChange={(e) => updateField("eduStart", e.target.value)}
                  />
                </label>
                <label className="resume-builder-field">
                  <span>End Year</span>
                  <input
                    value={data.eduEnd}
                    onChange={(e) => updateField("eduEnd", e.target.value)}
                  />
                </label>
                <label className="resume-builder-field">
                  <span>CGPA</span>
                  <input
                    value={data.cgpa}
                    onChange={(e) => updateField("cgpa", e.target.value)}
                  />
                </label>
              </div>
            </section>
          )}

          {activeSection === "export" && (
            <section className="resume-builder-sectioncard resume-builder-section">
              <h3>Export</h3>
              <p style={{ color: "var(--text-secondary)" }}>
                Copy your resume snapshot or download JSON data for backup.
              </p>
              <div className="resume-builder-sectionnav">
                <button
                  type="button"
                  className="resume-builder-navsecondary"
                  onClick={copyPreview}
                >
                  <Copy className="h-4 w-4" />
                  {copyStatus || "Copy Preview"}
                </button>
                <button
                  type="button"
                  className="resume-builder-navprimary"
                  onClick={exportResume}
                >
                  <Download className="h-4 w-4" />
                  Download Data
                </button>
              </div>
            </section>
          )}

          <div className="resume-builder-sectionnav">
            <button
              type="button"
              className="resume-builder-navsecondary"
              onClick={() =>
                setActiveSection(
                  sections[Math.max(0, currentSectionIndex - 1)].id,
                )
              }
              disabled={currentSectionIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              type="button"
              className="resume-builder-navprimary"
              onClick={() =>
                setActiveSection(
                  sections[
                    Math.min(sections.length - 1, currentSectionIndex + 1)
                  ].id,
                )
              }
              disabled={currentSectionIndex === sections.length - 1}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResumeBuilder;
