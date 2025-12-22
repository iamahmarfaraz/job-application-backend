CREATE DATABASE IF NOT EXISTS job_portal;
USE job_portal;

CREATE TABLE ApplicationStatus (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL UNIQUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE ApplicationStage (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL UNIQUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE Candidates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    firstName VARCHAR(100) NOT NULL,
    middleName VARCHAR(100),
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20),
    totalExperience DECIMAL(4,2),
    resumeUrl TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE Jobs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    jobCode VARCHAR(50) NOT NULL,
    jobTitle VARCHAR(150) NOT NULL,
    jobDescription TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE CandidateSkills (
    id INT PRIMARY KEY AUTO_INCREMENT,
    candidateId INT NOT NULL,
    skills TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_candidate_skills
        FOREIGN KEY (candidateId)
        REFERENCES Candidates(id)
        ON DELETE CASCADE
);

CREATE TABLE CandidateWorkExperience (
    id INT PRIMARY KEY AUTO_INCREMENT,
    candidateId INT NOT NULL,
    companyName VARCHAR(150),
    roleTitle VARCHAR(150),
    startDate DATE,
    endDate DATE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_candidate_experience
        FOREIGN KEY (candidateId)
        REFERENCES Candidates(id)
        ON DELETE CASCADE
);

CREATE TABLE Applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    candidateId INT NOT NULL,
    jobId INT NOT NULL,
    applicationStatusId INT NOT NULL,
    applicationStageId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_application_candidate
        FOREIGN KEY (candidateId)
        REFERENCES Candidates(id),

    CONSTRAINT fk_application_job
        FOREIGN KEY (jobId)
        REFERENCES Jobs(id),

    CONSTRAINT fk_application_status
        FOREIGN KEY (applicationStatusId)
        REFERENCES ApplicationStatus(id),

    CONSTRAINT fk_application_stage
        FOREIGN KEY (applicationStageId)
        REFERENCES ApplicationStage(id),

    CONSTRAINT unique_candidate_job
        UNIQUE (candidateId, jobId)
);

CREATE INDEX idx_candidates_email ON Candidates(email);
CREATE INDEX idx_jobs_jobCode ON Jobs(jobCode);
CREATE INDEX idx_applications_status ON Applications(applicationStatusId);
CREATE INDEX idx_applications_stage ON Applications(applicationStageId);

INSERT INTO ApplicationStatus (code) VALUES
('APPLIED'),
('REJECTED'),
('HIRED');

INSERT INTO ApplicationStage (code) VALUES
('REVIEWING'),
('SHORTLISTED'),
('INTERVIEW'),
('OFFER');

SELECT * FROM ApplicationStatus;
SELECT * FROM ApplicationStage;