import React, { useEffect, useMemo, useState } from 'react';
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Expand,
  FolderGit2,
  GraduationCap,
  Target,
  User,
  Wrench,
} from 'lucide-react';
import './ResumeBuilder.css';

type ResumeSection = 'personal' | 'summary' | 'skills' | 'experience' | 'projects' | 'education' | 'export';
type PreviewMode = 'desktop' | 'tablet' | 'mobile';

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

const createEmptyExperience = (): ExperienceItem => ({
  company: '',
  location: '',
  title: '',
  startDate: '',
  endDate: '',
  bullets: '',
});

const createEmptyProject = (): ProjectItem => ({
  title: '',
  githubUrl: '',
  techStack: '',
  dateRange: '',
  bullets: '',
});

const initialData: ResumeData = {
  fullName: 'Winster Mano',
  jobTitle: 'Software Developer',
  phone: '+91 8610913767',
  email: 'winster@example.com',
  linkedin: 'https://linkedin.com/in/winstermano',
  github: 'https://github.com/winstermano',
  location: 'Chennai, TN, India',
  summary:
    'ATS-focused software developer with experience building backend systems, REST APIs, and full-stack applications using modern tools and clean engineering practices.',
  skillsLanguages: 'Java 17+, SQL, JavaScript',
  skillsBackend: 'Spring Boot, REST API, React.js',
  skillsDatabases: 'MySQL, MongoDB',
  skillsTools: 'Git, Postman, Maven, Docker',
  experience: [
    {
      company: 'CareerPro',
      location: 'Chennai',
      title: 'Software Developer',
      startDate: 'Jan 2025',
      endDate: 'Present',
      bullets:
        'Built modular LMS features for ATS scoring and portfolio generation.\nDesigned API integrations and optimized frontend flows for student career tools.',
    },
  ],
  projects: [
    {
      title: 'ATS Resume Score Checker',
      githubUrl: 'https://github.com/winstermano/ats-checker',
      techStack: 'React, Node.js, Express',
      dateRange: 'Jan 2025 -- Mar 2025',
      bullets:
        'Implemented resume parsing, keyword scoring, and actionable suggestions.\nImproved user workflow with live preview and modular dashboard integration.',
    },
  ],
  college: 'Meenakshi College of Engineering',
  eduLocation: 'Chennai',
  degree: 'Bachelor of Technology (B.Tech) in Information Technology',
  eduStart: '2022',
  eduEnd: '2026',
  cgpa: '7.5 / 10',
};

const sections: { id: ResumeSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'summary', label: 'Summary', icon: Target },
  { id: 'skills', label: 'Technical Skills', icon: Wrench },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'export', label: 'Export', icon: Download },
];

function escapeLatex(value: string) {
  return value
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeLinkText(url: string) {
  return url.replace(/^https?:\/\//, '');
}

function generateLatex(data: ResumeData) {
  const formatBullets = (text: string) =>
    text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => `\\item ${escapeLatex(line)}`)
      .join('\n');

  const formatExperience = (items: ExperienceItem[]) =>
    items
      .filter((item) => item.company || item.title || item.bullets)
      .map(
        (item) => `
\\textbf{${escapeLatex(item.company || 'Company Name')}} \\hfill ${escapeLatex(item.location || 'Location')}
\\textit{${escapeLatex(item.title || 'Job Title')}} \\hfill ${escapeLatex(item.startDate || 'Start')} -- ${escapeLatex(item.endDate || 'End')}
\\begin{itemize}
${formatBullets(item.bullets || 'Add your experience highlights here.')}
\\end{itemize}`,
      )
      .join('\n\n');

  const formatProjects = (items: ProjectItem[]) =>
    items
      .filter((item) => item.title || item.techStack || item.bullets)
      .map(
        (item) => `
\\textbf{\\href{${item.githubUrl || 'https://github.com'}}{${escapeLatex(item.title || 'Project Title')}}} \\hfill ${escapeLatex(item.dateRange || 'Date Range')}
${escapeLatex(item.techStack || 'Tech Stack')}
\\begin{itemize}
${formatBullets(item.bullets || 'Add your project achievements here.')}
\\end{itemize}`,
      )
      .join('\n\n');

  return `\\documentclass[letterpaper,11pt]{article}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{tabularx}
\\pagestyle{empty}
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-0.6in}
\\addtolength{\\textheight}{1.2in}
\\urlstyle{same}
\\setlist[itemize]{noitemsep, topsep=2pt}
\\titleformat{\\section}{\\large\\bfseries}{}{0em}{}[\\titlerule]
\\titlespacing{\\section}{0pt}{6pt}{4pt}
\\begin{document}

% HEADER
\\begin{center}
{\\Huge \\textbf{${escapeLatex(data.fullName.toUpperCase())}}}\\\\
\\vspace{4pt}
${escapeLatex(data.phone)} $|$
\\href{mailto:${data.email}}{${escapeLatex(data.email)}} $|$
\\href{${data.linkedin}}{${escapeLatex(normalizeLinkText(data.linkedin))}} $|$
\\href{${data.github}}{${escapeLatex(normalizeLinkText(data.github))}}
\\end{center}

% SUMMARY
\\section{SUMMARY}
${escapeLatex(data.summary)}

% SKILLS
\\section{TECHNICAL SKILLS}
\\textbf{Languages \\& Core:} ${escapeLatex(data.skillsLanguages)}\\\\
\\textbf{Backend \\& Frameworks:} ${escapeLatex(data.skillsBackend)}\\\\
\\textbf{Databases:} ${escapeLatex(data.skillsDatabases)}\\\\
\\textbf{Tools \\& Practices:} ${escapeLatex(data.skillsTools)}

% EXPERIENCE
\\section{PROFESSIONAL EXPERIENCE}
${formatExperience(data.experience)}

% PROJECTS
\\section{PROJECTS}
${formatProjects(data.projects)}

% EDUCATION
\\section{EDUCATION}
\\textbf{${escapeLatex(data.college)}} \\hfill ${escapeLatex(data.eduLocation)}
${escapeLatex(data.degree)} \\hfill ${escapeLatex(data.eduStart)} -- ${escapeLatex(data.eduEnd)}
CGPA: ${escapeLatex(data.cgpa)}

\\vfill
\\end{document}`;
}

function generateHTMLPreview(data: ResumeData) {
  const formatBulletsHTML = (text: string) => {
    if (!text.trim()) return '';
    const items = text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    if (!items.length) return '';
    return `<ul style="margin:2px 0 4px 0;padding-left:18px;list-style-type:disc;">${items
      .map(
        (item) =>
          `<li style="margin:0;padding:0;line-height:1.4;font-size:14px;color:#000000;">${escapeHtml(item)}</li>`,
      )
      .join('')}</ul>`;
  };

  const sectionTitle = (title: string) =>
    `<div style="font-size:15px;font-weight:bold;text-transform:uppercase;border-bottom:1.2px solid #000000;padding-bottom:2px;margin:10px 0 4px 0;letter-spacing:0.02em;color:#000000;">${title}</div>`;

  const experienceHtml = data.experience
    .filter((item) => item.company || item.title || item.bullets)
    .map(
      (item) => `
      <div style="margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;align-items:baseline;">
          <strong style="font-size:14px;color:#000000;">${escapeHtml(item.company)}</strong>
          <span style="font-size:13px;color:#000000;">${escapeHtml(item.location)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:baseline;">
          <em style="font-size:13px;color:#000000;">${escapeHtml(item.title)}</em>
          <span style="font-size:13px;color:#000000;">${escapeHtml(
            `${item.startDate}${item.endDate ? ` -- ${item.endDate}` : ''}`,
          )}</span>
        </div>
        ${formatBulletsHTML(item.bullets)}
      </div>`,
    )
    .join('');

  const projectsHtml = data.projects
    .filter((item) => item.title || item.techStack || item.bullets)
    .map(
      (item) => `
      <div style="margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;align-items:baseline;">
          <strong style="font-size:14px;color:#000000;">${escapeHtml(item.title)}</strong>
          <span style="font-size:13px;color:#000000;">${escapeHtml(item.dateRange)}</span>
        </div>
        ${item.techStack ? `<div style="font-size:13px;color:#000000;margin:1px 0 2px 0;">${escapeHtml(item.techStack)}</div>` : ''}
        ${formatBulletsHTML(item.bullets)}
      </div>`,
    )
    .join('');

  return `
    <div style="
      font-family: 'Times New Roman', Times, serif;
      font-size: 14px;
      color: #000000;
      background: #ffffff;
      padding: 36px 48px;
      line-height: 1.4;
      height: auto;
      width: 100%;
      box-sizing: border-box;
    ">
      <div style="text-align:center;margin-bottom:8px;">
        <div style="font-size:26px;font-weight:bold;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:4px;color:#000000;">
          ${escapeHtml(data.fullName || 'YOUR NAME')}
        </div>
        <div style="font-size:13px;color:#000000;margin-bottom:0;">
          ${[
            data.phone ? escapeHtml(data.phone) : '',
            data.email
              ? `<a href="mailto:${escapeHtml(data.email)}" style="color:#000000;text-decoration:none;">${escapeHtml(data.email)}</a>`
              : '',
            data.linkedin
              ? `<a href="${escapeHtml(data.linkedin)}" style="color:#000000;text-decoration:none;">${escapeHtml(
                  normalizeLinkText(data.linkedin),
                )}</a>`
              : '',
            data.github
              ? `<a href="${escapeHtml(data.github)}" style="color:#000000;text-decoration:none;">${escapeHtml(
                  normalizeLinkText(data.github),
                )}</a>`
              : '',
          ]
            .filter(Boolean)
            .join(' | ')}
        </div>
      </div>

      ${data.summary ? `${sectionTitle('SUMMARY')}<div style="font-size:14px;line-height:1.5;margin:2px 0 6px 12px;color:#000000;">${escapeHtml(data.summary)}</div>` : ''}

      ${data.skillsLanguages || data.skillsBackend || data.skillsDatabases || data.skillsTools
        ? `${sectionTitle('TECHNICAL SKILLS')}
          <div style="margin:4px 0 6px 12px;">
            ${data.skillsLanguages ? `<div style="font-size:13.5px;color:#000000;line-height:1.5;margin:0;"><strong>Languages &amp; Core:</strong> ${escapeHtml(data.skillsLanguages)}</div>` : ''}
            ${data.skillsBackend ? `<div style="font-size:13.5px;color:#000000;line-height:1.5;margin:0;"><strong>Backend &amp; Persistence:</strong> ${escapeHtml(data.skillsBackend)}</div>` : ''}
            ${data.skillsDatabases ? `<div style="font-size:13.5px;color:#000000;line-height:1.5;margin:0;"><strong>Databases &amp; NoSQL:</strong> ${escapeHtml(data.skillsDatabases)}</div>` : ''}
            ${data.skillsTools ? `<div style="font-size:13.5px;color:#000000;line-height:1.5;margin:0;"><strong>Tools &amp; Practices:</strong> ${escapeHtml(data.skillsTools)}</div>` : ''}
          </div>`
        : ''}

      ${experienceHtml ? `${sectionTitle('PROFESSIONAL EXPERIENCE')}<div style="margin:4px 0 0 12px;">${experienceHtml}</div>` : ''}

      ${projectsHtml ? `${sectionTitle('PROJECTS')}<div style="margin:4px 0 0 12px;">${projectsHtml}</div>` : ''}

      ${data.college
        ? `${sectionTitle('EDUCATION')}
          <div style="margin:4px 0 0 12px;">
            <div style="display:flex;justify-content:space-between;align-items:baseline;">
              <strong style="font-size:14px;color:#000000;">${escapeHtml(data.college)}</strong>
              <span style="font-size:13px;color:#000000;">${escapeHtml(data.eduLocation)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:baseline;">
              <span style="font-size:13px;color:#000000;">${escapeHtml(data.degree)}</span>
              <span style="font-size:13px;color:#000000;">${escapeHtml(
                `${data.eduStart}${data.eduEnd ? ` -- ${data.eduEnd}` : ''}`,
              )}</span>
            </div>
            ${data.cgpa ? `<div style="font-size:13px;color:#000000;margin-top:2px;">CGPA: ${escapeHtml(data.cgpa)}</div>` : ''}
          </div>`
        : ''}
    </div>`;
}

const modalPreviewWidths: Record<PreviewMode, number> = {
  desktop: 794,
  tablet: 600,
  mobile: 390,
};

const ResumeBuilder: React.FC = () => {
  const [activeSection, setActiveSection] = useState<ResumeSection>('personal');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  const [data, setData] = useState<ResumeData>(initialData);

  const latexCode = useMemo(() => generateLatex(data), [data]);
  const previewHtml = useMemo(() => generateHTMLPreview(data), [data]);

  const validationErrors = useMemo(() => {
    const errors = new Set<string>();
    if (!data.fullName.trim()) errors.add('fullName');
    if (!data.phone.trim()) errors.add('phone');
    if (!data.email.trim()) errors.add('email');
    if (!data.summary.trim()) errors.add('summary');
    if (!data.skillsLanguages.trim()) errors.add('skillsLanguages');
    if (!data.college.trim()) errors.add('college');
    if (!data.degree.trim()) errors.add('degree');

    data.experience.forEach((item, index) => {
      if (!item.company.trim()) errors.add(`experience-company-${index}`);
      if (!item.title.trim()) errors.add(`experience-title-${index}`);
      if (!item.bullets.trim()) errors.add(`experience-bullets-${index}`);
    });

    data.projects.forEach((item, index) => {
      if (!item.title.trim()) errors.add(`project-title-${index}`);
      if (!item.techStack.trim()) errors.add(`project-tech-${index}`);
      if (!item.bullets.trim()) errors.add(`project-bullets-${index}`);
    });

    return errors;
  }, [data]);

  useEffect(() => {
    if (!isFullscreenPreview) return undefined;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFullscreenPreview(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isFullscreenPreview]);

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(''), 2000);
  };

  const isFieldInvalid = (field: string) => showValidation && validationErrors.has(field);

  const updateData = <K extends keyof ResumeData>(field: K, value: ResumeData[K]) => {
    setData((current) => ({ ...current, [field]: value }));
  };

  const updateExperience = (index: number, field: keyof ExperienceItem, value: string) => {
    setData((current) => ({
      ...current,
      experience: current.experience.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const updateProject = (index: number, field: keyof ProjectItem, value: string) => {
    setData((current) => ({
      ...current,
      projects: current.projects.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const addExperience = () => {
    setData((current) =>
      current.experience.length >= 5
        ? current
        : { ...current, experience: [...current.experience, createEmptyExperience()] },
    );
  };

  const addProject = () => {
    setData((current) =>
      current.projects.length >= 6
        ? current
        : { ...current, projects: [...current.projects, createEmptyProject()] },
    );
  };

  const removeExperience = (index: number) => {
    setData((current) => {
      const next = current.experience.filter((_, itemIndex) => itemIndex !== index);
      return { ...current, experience: next.length ? next : [createEmptyExperience()] };
    });
  };

  const removeProject = (index: number) => {
    setData((current) => {
      const next = current.projects.filter((_, itemIndex) => itemIndex !== index);
      return { ...current, projects: next.length ? next : [createEmptyProject()] };
    });
  };

  const handleDownload = () => {
    setShowValidation(true);
    if (validationErrors.size > 0) {
      showToast('Please fill the required fields highlighted in red.');
      return;
    }

    const blob = new Blob([latexCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'resume.tex';
    anchor.click();
    URL.revokeObjectURL(url);
    showToast('resume.tex downloaded! Upload to overleaf.com');
  };

  const handleCopy = async () => {
    setShowValidation(true);
    if (validationErrors.size > 0) {
      showToast('Please fill the required fields highlighted in red.');
      return;
    }

    await navigator.clipboard.writeText(latexCode);
    showToast('Copied!');
  };

  const renderInput = (
    field: keyof ResumeData,
    label: string,
    placeholder: string,
    isTextArea = false,
    rows = 4,
  ) => (
    <label className="resume-builder-field">
      <span>{label}</span>
      {isTextArea ? (
        <textarea
          value={data[field] as string}
          onChange={(event) => updateData(field, event.target.value as ResumeData[keyof ResumeData])}
          placeholder={placeholder}
          rows={rows}
          className={isFieldInvalid(field) ? 'resume-builder-invalid' : ''}
        />
      ) : (
        <input
          value={data[field] as string}
          onChange={(event) => updateData(field, event.target.value as ResumeData[keyof ResumeData])}
          placeholder={placeholder}
          className={isFieldInvalid(field) ? 'resume-builder-invalid' : ''}
        />
      )}
    </label>
  );

  const activeSectionIndex = sections.findIndex((section) => section.id === activeSection);
  const previousSection = activeSectionIndex > 0 ? sections[activeSectionIndex - 1] : null;
  const nextSection = activeSectionIndex < sections.length - 1 ? sections[activeSectionIndex + 1] : null;

  const renderSectionNavigation = () => (
    <div className="resume-builder-sectionnav">
      <button
        type="button"
        className="resume-builder-navsecondary"
        disabled={!previousSection}
        onClick={() => previousSection && setActiveSection(previousSection.id)}
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Previous</span>
      </button>
      <button
        type="button"
        className="resume-builder-navprimary"
        disabled={!nextSection}
        onClick={() => nextSection && setActiveSection(nextSection.id)}
      >
        <span>Next</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="resume-builder-page">
      <div className="resume-builder-shell">
        <aside className="resume-builder-navpanel">
          <div className="resume-builder-brand">
            <h2>Resume Builder</h2>
            <p>Fill sections to generate</p>
          </div>

          <div className="resume-builder-navlist">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  type="button"
                  className={`resume-builder-navbtn ${activeSection === section.id ? 'is-active' : ''}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <Icon className="h-4 w-4" />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="resume-builder-formpanel">
          <div className="resume-builder-panelhead">
            <h1>Resume Builder</h1>
            <p>Template-driven LaTeX resume generator with live preview.</p>
          </div>

          <div className="resume-builder-sectioncard">
            {activeSection === 'personal' && (
              <div className="resume-builder-section">
                <h3>Personal Info</h3>
                <div className="resume-builder-grid">
                  {renderInput('fullName', 'Full Name', 'Winster Mano')}
                  {renderInput('jobTitle', 'Job Title / Role', 'Software Developer')}
                  {renderInput('phone', 'Phone', '+91 8610913767')}
                  {renderInput('email', 'Email', 'name@example.com')}
                  {renderInput('linkedin', 'LinkedIn URL', 'https://linkedin.com/in/yourprofile')}
                  {renderInput('github', 'GitHub URL', 'https://github.com/yourprofile')}
                  {renderInput('location', 'Location', 'Chennai, TN, India')}
                </div>
                {renderSectionNavigation()}
              </div>
            )}

            {activeSection === 'summary' && (
              <div className="resume-builder-section">
                <h3>Summary</h3>
                {renderInput('summary', 'Professional Summary', 'Write a 3-4 sentence ATS-optimized summary...', true, 6)}
                {renderSectionNavigation()}
              </div>
            )}

            {activeSection === 'skills' && (
              <div className="resume-builder-section">
                <h3>Technical Skills</h3>
                <div className="resume-builder-grid">
                  {renderInput('skillsLanguages', 'Languages & Core', 'Java 17+, SQL, JavaScript')}
                  {renderInput('skillsBackend', 'Backend & Frameworks', 'Spring Boot, REST API')}
                  {renderInput('skillsDatabases', 'Databases', 'MySQL, MongoDB')}
                  {renderInput('skillsTools', 'Tools & Practices', 'Git, Postman, Maven')}
                </div>
                {renderSectionNavigation()}
              </div>
            )}

            {activeSection === 'experience' && (
              <div className="resume-builder-section">
                <div className="resume-builder-sectiontop">
                  <h3>Experience</h3>
                  <button type="button" className="resume-builder-accentbtn" onClick={addExperience}>
                    Add Experience
                  </button>
                </div>

                <div className="resume-builder-stack">
                  {data.experience.map((item, index) => (
                    <div key={`experience-${index}`} className="resume-builder-block">
                      <button
                        type="button"
                        className="resume-builder-remove"
                        onClick={() => removeExperience(index)}
                        disabled={data.experience.length === 1}
                      >
                        ×
                      </button>
                      <div className="resume-builder-grid">
                        <label className="resume-builder-field">
                          <span>Company Name</span>
                          <input
                            value={item.company}
                            onChange={(event) => updateExperience(index, 'company', event.target.value)}
                            className={isFieldInvalid(`experience-company-${index}`) ? 'resume-builder-invalid' : ''}
                          />
                        </label>
                        <label className="resume-builder-field">
                          <span>Location</span>
                          <input
                            value={item.location}
                            onChange={(event) => updateExperience(index, 'location', event.target.value)}
                          />
                        </label>
                        <label className="resume-builder-field">
                          <span>Job Title</span>
                          <input
                            value={item.title}
                            onChange={(event) => updateExperience(index, 'title', event.target.value)}
                            className={isFieldInvalid(`experience-title-${index}`) ? 'resume-builder-invalid' : ''}
                          />
                        </label>
                        <label className="resume-builder-field">
                          <span>Start Date -- End Date</span>
                          <div className="resume-builder-inline">
                            <input
                              value={item.startDate}
                              onChange={(event) => updateExperience(index, 'startDate', event.target.value)}
                            />
                            <input
                              value={item.endDate}
                              onChange={(event) => updateExperience(index, 'endDate', event.target.value)}
                            />
                          </div>
                        </label>
                        <label className="resume-builder-field resume-builder-field-full">
                          <span>Bullet Points</span>
                          <textarea
                            value={item.bullets}
                            onChange={(event) => updateExperience(index, 'bullets', event.target.value)}
                            rows={5}
                            className={isFieldInvalid(`experience-bullets-${index}`) ? 'resume-builder-invalid' : ''}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
                {renderSectionNavigation()}
              </div>
            )}

            {activeSection === 'projects' && (
              <div className="resume-builder-section">
                <div className="resume-builder-sectiontop">
                  <h3>Projects</h3>
                  <button type="button" className="resume-builder-accentbtn" onClick={addProject}>
                    Add Project
                  </button>
                </div>

                <div className="resume-builder-stack">
                  {data.projects.map((item, index) => (
                    <div key={`project-${index}`} className="resume-builder-block">
                      <button
                        type="button"
                        className="resume-builder-remove"
                        onClick={() => removeProject(index)}
                        disabled={data.projects.length === 1}
                      >
                        ×
                      </button>
                      <div className="resume-builder-grid">
                        <label className="resume-builder-field">
                          <span>Project Title</span>
                          <input
                            value={item.title}
                            onChange={(event) => updateProject(index, 'title', event.target.value)}
                            className={isFieldInvalid(`project-title-${index}`) ? 'resume-builder-invalid' : ''}
                          />
                        </label>
                        <label className="resume-builder-field">
                          <span>GitHub URL</span>
                          <input
                            value={item.githubUrl}
                            onChange={(event) => updateProject(index, 'githubUrl', event.target.value)}
                          />
                        </label>
                        <label className="resume-builder-field">
                          <span>Tech Stack</span>
                          <input
                            value={item.techStack}
                            onChange={(event) => updateProject(index, 'techStack', event.target.value)}
                            className={isFieldInvalid(`project-tech-${index}`) ? 'resume-builder-invalid' : ''}
                          />
                        </label>
                        <label className="resume-builder-field">
                          <span>Date Range</span>
                          <input
                            value={item.dateRange}
                            onChange={(event) => updateProject(index, 'dateRange', event.target.value)}
                          />
                        </label>
                        <label className="resume-builder-field resume-builder-field-full">
                          <span>Bullet Points</span>
                          <textarea
                            value={item.bullets}
                            onChange={(event) => updateProject(index, 'bullets', event.target.value)}
                            rows={5}
                            className={isFieldInvalid(`project-bullets-${index}`) ? 'resume-builder-invalid' : ''}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
                {renderSectionNavigation()}
              </div>
            )}

            {activeSection === 'education' && (
              <div className="resume-builder-section">
                <h3>Education</h3>
                <div className="resume-builder-grid">
                  {renderInput('college', 'College/University Name', 'Meenakshi College of Engineering')}
                  {renderInput('eduLocation', 'Location', 'Chennai')}
                  {renderInput('degree', 'Degree', 'Bachelor of Technology (B.Tech) in Information Technology')}
                  <label className="resume-builder-field">
                    <span>Start Year -- End Year</span>
                    <div className="resume-builder-inline">
                      <input value={data.eduStart} onChange={(event) => updateData('eduStart', event.target.value)} />
                      <input value={data.eduEnd} onChange={(event) => updateData('eduEnd', event.target.value)} />
                    </div>
                  </label>
                  {renderInput('cgpa', 'CGPA', '7.5 / 10')}
                </div>
                {renderSectionNavigation()}
              </div>
            )}

            {activeSection === 'export' && (
              <div className="resume-builder-section">
                <h3>Generate Your Resume</h3>
                <p className="resume-builder-exportcopy">
                  Your LaTeX resume is ready. Copy the code and paste it into Overleaf to generate your PDF.
                </p>
                <div className="resume-builder-exportactions">
                  <button type="button" className="resume-builder-primarybtn" onClick={() => void handleCopy()}>
                    <Copy className="h-4 w-4" />
                    <span>Copy LaTeX Code</span>
                  </button>
                </div>
                <div className="resume-builder-codebox">
                  <pre>{latexCode}</pre>
                </div>
                {renderSectionNavigation()}
              </div>
            )}
          </div>
        </section>

        <aside className="resume-builder-previewpanel">
          <div className="resume-builder-previewhead">
            <div className="resume-builder-previewtitle">
              <h3>Live Preview</h3>
              <p>
                <span className="resume-builder-live-dot">?</span> Live
              </p>
            </div>
            <div className="resume-builder-previewcontrols">
              <div className="resume-builder-tabs">
                {(['desktop', 'tablet', 'mobile'] as PreviewMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={previewMode === mode ? 'is-active' : ''}
                    onClick={() => setPreviewMode(mode)}
                  >
                    {mode[0].toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="resume-builder-expandbtn"
                onClick={() => setIsFullscreenPreview(true)}
                aria-label="Open fullscreen preview"
              >
                <Expand className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="resume-builder-previewstage">
            <div
              style={{
                width: '436px',
                height: 'auto',
                overflow: 'hidden',
                background: '#0a0a0a',
                borderRadius: '8px',
                padding: '4px',
              }}
            >
              <div
                className={`resume-builder-previewframe resume-builder-previewframe-${previewMode}`}
                style={{
                  transform: 'scale(0.55)',
                  transformOrigin: 'top left',
                  width: '794px',
                  height: 'auto',
                  background: '#ffffff',
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </div>
            </div>
          </div>
        </aside>
      </div>

      {isFullscreenPreview && (
        <div className="resume-builder-modal">
          <div className="resume-builder-modalbar">
            <div className="resume-builder-modaltitle">Resume Preview</div>
            <div className="resume-builder-modalcontrols">
              <div className="resume-builder-tabs">
                {(['desktop', 'tablet', 'mobile'] as PreviewMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={previewMode === mode ? 'is-active' : ''}
                    onClick={() => setPreviewMode(mode)}
                  >
                    {mode[0].toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="resume-builder-modalactions">
              <button type="button" className="resume-builder-modaldownload" onClick={handleDownload}>
                Download .tex
              </button>
              <button type="button" className="resume-builder-modalclose" onClick={() => setIsFullscreenPreview(false)}>
                Close
              </button>
            </div>
          </div>

          <div className="resume-builder-modalbody">
            <div
              className="resume-builder-modalpreview"
              style={{
                background: '#ffffff',
                width: `${modalPreviewWidths[previewMode]}px`,
                margin: '0 auto',
                height: 'auto',
                boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
              }}
            >
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </div>
        </div>
      )}

      {toastMessage && <div className="resume-builder-toast">{toastMessage}</div>}
    </div>
  );
};

export default ResumeBuilder;
