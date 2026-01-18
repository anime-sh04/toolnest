(function() {
    let state = {
        gradingTable: [
            { id: 1, grade: 'A+', points: 4.0 },
            { id: 2, grade: 'A', points: 4.0 },
            { id: 3, grade: 'A-', points: 3.7 },
            { id: 4, grade: 'B+', points: 3.3 },
            { id: 5, grade: 'B', points: 3.0 },
            { id: 6, grade: 'B-', points: 2.7 },
            { id: 7, grade: 'C+', points: 2.3 },
            { id: 8, grade: 'C', points: 2.0 },
            { id: 9, grade: 'C-', points: 1.7 },
            { id: 10, grade: 'D', points: 1.0 },
            { id: 11, grade: 'F', points: 0.0 }
        ],
        semesters: [
            {
                id: 1,
                name: 'Semester 1',
                subjects: [
                    { id: 1, name: '', credits: '', grade: '' },
                    { id: 2, name: '', credits: '', grade: '' },
                    { id: 3, name: '', credits: '', grade: '' },
                    { id: 4, name: '', credits: '', grade: '' }
                ]
            }
        ],
        nextGradeId: 12,
        nextSemesterId: 2,
        nextSubjectId: 5
    };

    const gradingPresets = {
        '4.0': {
            grades: [
                { grade: 'A+', points: 4.0 },
                { grade: 'A', points: 4.0 },
                { grade: 'A-', points: 3.7 },
                { grade: 'B+', points: 3.3 },
                { grade: 'B', points: 3.0 },
                { grade: 'B-', points: 2.7 },
                { grade: 'C+', points: 2.3 },
                { grade: 'C', points: 2.0 },
                { grade: 'C-', points: 1.7 },
                { grade: 'D', points: 1.0 },
                { grade: 'F', points: 0.0 }
            ],
            disclaimer: null
        },
        '10.0': {
            grades: [
                { grade: 'O (Outstanding)', points: 10.0 },
                { grade: 'A+ (Excellent)', points: 9.0 },
                { grade: 'A (Very Good)', points: 8.0 },
                { grade: 'B+ (Good)', points: 7.0 },
                { grade: 'B (Above Average)', points: 6.0 },
                { grade: 'C (Average)', points: 5.0 },
                { grade: 'P (Pass)', points: 4.0 },
                { grade: 'F (Fail)', points: 0.0 }
            ],
            disclaimer: null
        },
        '5.0': {
            grades: [
                { grade: 'A', points: 5.0 },
                { grade: 'B', points: 4.0 },
                { grade: 'C', points: 3.0 },
                { grade: 'D', points: 2.0 },
                { grade: 'E', points: 1.0 },
                { grade: 'F', points: 0.0 }
            ],
            disclaimer: null
        },
        '7.0': {
            grades: [
                { grade: 'HD (High Distinction)', points: 7.0 },
                { grade: 'D (Distinction)', points: 6.0 },
                { grade: 'C (Credit)', points: 5.0 },
                { grade: 'P (Pass)', points: 4.0 },
                { grade: 'F (Fail)', points: 0.0 }
            ],
            disclaimer: null
        },
        'percentage': {
            grades: [
                { grade: '90-100%', points: 4.0 },
                { grade: '85-89%', points: 3.7 },
                { grade: '80-84%', points: 3.3 },
                { grade: '75-79%', points: 3.0 },
                { grade: '70-74%', points: 2.7 },
                { grade: '65-69%', points: 2.3 },
                { grade: '60-64%', points: 2.0 },
                { grade: '55-59%', points: 1.7 },
                { grade: '50-54%', points: 1.3 },
                { grade: '0-49%', points: 0.0 }
            ],
            disclaimer: '<strong>⚠️ Approximate Conversion</strong>Percentage-to-GPA conversions vary significantly by university and country. This is a general approximation only. Always verify with your institution\'s official conversion policy before using these values for academic decisions.'
        }
    };

    window.loadPreset = function(presetKey) {
        if (!presetKey || !gradingPresets[presetKey]) {
            document.getElementById('presetDisclaimer').classList.remove('active');
            return;
        }
        
        const preset = gradingPresets[presetKey];
        
        const disclaimerEl = document.getElementById('presetDisclaimer');
        if (preset.disclaimer) {
            disclaimerEl.innerHTML = preset.disclaimer;
            disclaimerEl.classList.add('active');
        } else {
            disclaimerEl.classList.remove('active');
        }
        
        state.gradingTable = preset.grades.map((item, index) => ({
            id: index + 1,
            grade: item.grade,
            points: item.points
        }));
        state.nextGradeId = preset.grades.length + 1;
        
        render();
        document.getElementById('presetSelector').value = '';
    };

    window.toggleGradingModal = function() {
        const modal = document.getElementById('gradingModal');
        modal.classList.toggle('active');
    };

    function isValidGrade(grade) {
        return state.gradingTable.some(g => g.grade === grade);
    }

    function getGradePoints(grade) {
        const gradeObj = state.gradingTable.find(g => g.grade === grade);
        return gradeObj ? gradeObj.points : 0;
    }

    function getMaxGradePoints() {
        if (state.gradingTable.length === 0) return 4.0;
        return Math.max(...state.gradingTable.map(g => g.points));
    }

    window.addGrade = function() {
        state.gradingTable.push({
            id: state.nextGradeId++,
            grade: '',
            points: 0
        });
        render();
    };

    window.removeGrade = function(id) {
        state.gradingTable = state.gradingTable.filter(g => g.id !== id);
        render();
    };

    window.updateGrade = function(id, field, value) {
        const grade = state.gradingTable.find(g => g.id === id);
        if (grade) {
            grade[field] = field === 'points' ? parseFloat(value) || 0 : value;
            render();
        }
    };

    window.addSemester = function() {
        const existingSemesterNumbers = state.semesters.map(s => {
            const match = s.name.match(/Semester (\d+)/);
            return match ? parseInt(match[1]) : 0;
        });
        const nextNumber = existingSemesterNumbers.length > 0 
            ? Math.max(...existingSemesterNumbers) + 1 
            : 1;
        
        state.semesters.push({
            id: state.nextSemesterId++,
            name: `Semester ${nextNumber}`,
            subjects: [
                { id: state.nextSubjectId++, name: '', credits: '', grade: '' },
                { id: state.nextSubjectId++, name: '', credits: '', grade: '' },
                { id: state.nextSubjectId++, name: '', credits: '', grade: '' },
                { id: state.nextSubjectId++, name: '', credits: '', grade: '' }
            ]
        });
        render();
    };

    window.removeSemester = function(id) {
        state.semesters = state.semesters.filter(s => s.id !== id);
        render();
    };

    window.addSubject = function(semesterId) {
        const semester = state.semesters.find(s => s.id === semesterId);
        if (semester) {
            semester.subjects.push({
                id: state.nextSubjectId++,
                name: '',
                credits: '',
                grade: ''
            });
            render();
        }
    };

    window.removeSubject = function(semesterId, subjectId) {
        const semester = state.semesters.find(s => s.id === semesterId);
        if (semester) {
            semester.subjects = semester.subjects.filter(sub => sub.id !== subjectId);
            render();
        }
    };

    window.updateSubject = function(semesterId, subjectId, field, value) {
        const semester = state.semesters.find(s => s.id === semesterId);
        if (semester) {
            const subject = semester.subjects.find(sub => sub.id === subjectId);
            if (subject) {
                subject[field] = field === 'credits' ? (value === '' ? '' : parseFloat(value) || '') : value;
                render();
            }
        }
    };

    function calculateSemesterGPA(semester) {
        let totalCredits = 0;
        let totalPoints = 0;
        let hasInvalid = false;

        for (const subject of semester.subjects) {
            if (!subject.grade || subject.credits === '' || subject.credits === 0) continue;
            if (!isValidGrade(subject.grade)) {
                hasInvalid = true;
                continue;
            }
            const credits = parseFloat(subject.credits) || 0;
            const points = getGradePoints(subject.grade);
            totalCredits += credits;
            totalPoints += credits * points;
        }

        return {
            gpa: totalCredits > 0 ? totalPoints / totalCredits : 0,
            credits: totalCredits,
            hasInvalid
        };
    }

    function calculateCGPA() {
        let totalCredits = 0;
        let totalPoints = 0;
        let hasInvalid = false;

        for (const semester of state.semesters) {
            for (const subject of semester.subjects) {
                if (!subject.grade || subject.credits === '' || subject.credits === 0) continue;
                if (!isValidGrade(subject.grade)) {
                    hasInvalid = true;
                    continue;
                }
                const credits = parseFloat(subject.credits) || 0;
                const points = getGradePoints(subject.grade);
                totalCredits += credits;
                totalPoints += credits * points;
            }
        }

        return {
            cgpa: totalCredits > 0 ? totalPoints / totalCredits : 0,
            totalCredits,
            hasInvalid
        };
    }

    function createCircularGauge(value, maxValue, label, credits) {
        const radius = 60;
        const circumference = 2 * Math.PI * radius;
        const percentage = Math.min(value / maxValue, 1);
        const offset = circumference - (percentage * circumference);

        return `
            <div class="circular-gauge">
                <svg class="gauge-svg" viewBox="0 0 140 140">
                    <circle class="gauge-bg" cx="70" cy="70" r="${radius}"></circle>
                    <circle class="gauge-progress" cx="70" cy="70" r="${radius}"
                        style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${offset};"></circle>
                </svg>
                <div class="gauge-value">
                    <div class="gauge-number">${value.toFixed(2)}</div>
                    <div class="gauge-label">out of ${maxValue.toFixed(1)}</div>
                </div>
            </div>
            ${credits !== undefined ? `<div class="credits">${credits} credits</div>` : ''}
        `;
    }

    function renderGradingTable() {
        const container = document.getElementById('gradingTable');
        container.innerHTML = `
            <div class="grade-labels">
                <div class="grade-label">Grade Label</div>
                <div class="grade-label">Official Grade Points</div>
                <div></div>
            </div>
        ` + state.gradingTable.map(grade => `
            <div class="grade-row">
                <input 
                    type="text" 
                    value="${grade.grade}" 
                    placeholder="e.g., A+" 
                    onchange="window.updateGrade(${grade.id}, 'grade', this.value)"
                />
                <input 
                    type="number" 
                    step="0.1" 
                    value="${grade.points}" 
                    placeholder="e.g., 4.0"
                    onchange="window.updateGrade(${grade.id}, 'points', this.value)"
                />
                <button class="btn-delete" onclick="window.removeGrade(${grade.id})" title="Delete grade">×</button>
            </div>
        `).join('');
    }

    function renderSemesters() {
        const container = document.getElementById('semestersContainer');
        
        if (state.semesters.length === 0) {
            container.innerHTML = '<p style="color: var(--muted); text-align: center;">No semesters added yet.</p>';
            return;
        }

        container.innerHTML = state.semesters.map(semester => {
            const semesterResult = calculateSemesterGPA(semester);
            
            return `
                <div class="semester-card">
                    <div class="semester-header">
                        <h2 class="semester-title">${semester.name}</h2>
                    </div>
                    
                    <table class="subjects-table">
                        <thead>
                            <tr>
                                <th>Course Name</th>
                                <th style="width: 150px;">Grade</th>
                                <th style="width: 120px;">Credits</th>
                                <th style="width: 50px;"></th>
                            </tr>
                        </thead>
                        <tbody>
                            ${semester.subjects.map(subject => {
                                const invalid = subject.grade && !isValidGrade(subject.grade);
                                return `
                                    <tr class="${invalid ? 'invalid' : ''}">
                                        <td>
                                            <input 
                                                type="text" 
                                                value="${subject.name}" 
                                                placeholder="Course name"
                                                onchange="window.updateSubject(${semester.id}, ${subject.id}, 'name', this.value)"
                                            />
                                        </td>
                                        <td>
                                            <div style="display: flex; align-items: center;">
                                                <select onchange="window.updateSubject(${semester.id}, ${subject.id}, 'grade', this.value)">
                                                    <option value="">Grade</option>
                                                    ${state.gradingTable.map(g => `
                                                        <option value="${g.grade}" ${subject.grade === g.grade ? 'selected' : ''}>
                                                            ${g.grade} (${g.points})
                                                        </option>
                                                    `).join('')}
                                                </select>
                                                ${invalid ? '<span class="invalid-badge">Invalid</span>' : ''}
                                            </div>
                                        </td>
                                        <td>
                                            <input 
                                                type="number" 
                                                min="0" 
                                                step="0.5"
                                                value="${subject.credits}" 
                                                placeholder="Credits"
                                                onchange="window.updateSubject(${semester.id}, ${subject.id}, 'credits', this.value)"
                                            />
                                        </td>
                                        <td>
                                            <button class="btn-delete" onclick="window.removeSubject(${semester.id}, ${subject.id})" title="Delete subject">×</button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                    
                    <div class="semester-footer">
                        <div class="semester-footer-info">
                            ${semesterResult.credits > 0 ? `${semesterResult.credits} credits` : ''}
                        </div>
                        <div class="semester-footer-buttons">
                            <button class="btn" onclick="window.addSubject(${semester.id})">+ Add Course</button>
                            ${state.semesters.length > 1 ? `<button class="btn" onclick="window.removeSemester(${semester.id})">Delete Semester</button>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderResults() {
        const cgpaResult = calculateCGPA();
        const errorBanner = document.getElementById('errorBanner');
        const resultsGrid = document.getElementById('resultsGrid');
        const maxGPA = getMaxGradePoints();

        let invalidCount = 0;
        for (const semester of state.semesters) {
            for (const subject of semester.subjects) {
                if (subject.grade && !isValidGrade(subject.grade)) {
                    invalidCount++;
                }
            }
        }

        if (invalidCount > 0) {
            errorBanner.style.display = 'flex';
            errorBanner.className = 'error-banner';
            errorBanner.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <div>
                    <strong>Cannot calculate results:</strong> ${invalidCount} subject${invalidCount > 1 ? 's have' : ' has'} invalid grade${invalidCount > 1 ? 's' : ''}. 
                    Please fix or remove the invalid grade${invalidCount > 1 ? 's' : ''} to see your GPA/CGPA.
                </div>
            `;
            resultsGrid.innerHTML = '';
            return;
        }

        errorBanner.style.display = 'none';

        let resultsHTML = '';
        
        if (state.semesters.length > 1) {
            state.semesters.forEach(semester => {
                const result = calculateSemesterGPA(semester);
                if (result.credits > 0) {
                    resultsHTML += `
                        <div class="result-card">
                            <h3>${semester.name}</h3>
                            ${createCircularGauge(result.gpa, maxGPA, semester.name, result.credits)}
                        </div>
                    `;
                }
            });
        }

        if (cgpaResult.totalCredits > 0) {
            resultsHTML += `
                <div class="result-card ${state.semesters.length > 1 ? 'cgpa-result' : ''}">
                    <h3>${state.semesters.length > 1 ? 'Cumulative GPA (CGPA)' : 'GPA'}</h3>
                    ${createCircularGauge(cgpaResult.cgpa, maxGPA, 'CGPA', cgpaResult.totalCredits)}
                </div>
            `;
        }

        if (!resultsHTML) {
            resultsHTML = '<div style="text-align: center; color: var(--muted);">Add subjects and grades to see results</div>';
        }

        resultsGrid.innerHTML = resultsHTML;
    }

    function render() {
        renderGradingTable();
        renderSemesters();
        renderResults();
    }

    document.getElementById('gradingModal').addEventListener('click', function(e) {
        if (e.target === this) {
            window.toggleGradingModal();
        }
    });

    render();
})();