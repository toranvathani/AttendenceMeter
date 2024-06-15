document.addEventListener('DOMContentLoaded', () => {
    const attendanceForm = document.getElementById('attendanceForm');
    const presentRadio = document.getElementById('presentRadio');
    const absentRadio = document.getElementById('absentRadio');
    const nameDiv = document.getElementById('nameDiv');
    const signatureDiv = document.getElementById('signatureDiv');
    const messageDiv = document.getElementById('message');
    const recordsDiv = document.getElementById('records');
    const downloadBtn = document.getElementById('downloadBtn');
    const signatureCanvas = document.getElementById('signature');
    const clearBtn = document.getElementById('clearBtn');
    let records = [];
    let isDrawing = false;
    let ctx = signatureCanvas.getContext('2d');

    // Function to toggle visibility of name and signature sections based on presence status
    function toggleDetails() {
        if (presentRadio.checked) {
            nameDiv.style.display = 'block';
            signatureDiv.style.display = 'block';
        } else if (absentRadio.checked) {
            nameDiv.style.display = 'block';
            signatureDiv.style.display = 'none';
        } else {
            nameDiv.style.display = 'none';
            signatureDiv.style.display = 'none';
        }
    }

    // Initial toggle based on default radio button checked state
    toggleDetails();

    // Event listener for radio button change
    presentRadio.addEventListener('change', toggleDetails);
    absentRadio.addEventListener('change', toggleDetails);

    // Function to start drawing the signature
    function startDrawing(event) {
        isDrawing = true;
        ctx.beginPath();
        ctx.moveTo(event.offsetX, event.offsetY);
    }

    // Function to draw the signature
    function draw(event) {
        if (!isDrawing) return;
        ctx.lineTo(event.offsetX, event.offsetY);
        ctx.stroke();
    }

    // Function to stop drawing the signature
    function stopDrawing() {
        isDrawing = false;
    }

    // Clear the signature canvas
    clearBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
    });

    // Attach event listeners for signature drawing
    signatureCanvas.addEventListener('mousedown', startDrawing);
    signatureCanvas.addEventListener('mousemove', draw);
    signatureCanvas.addEventListener('mouseup', stopDrawing);
    signatureCanvas.addEventListener('mouseout', stopDrawing);

    // Function to mark attendance and save it in memory
    function markAttendance(present, name = '', idNumber = '', signatureData = '') {
        const time = new Date().toLocaleString();
        const record = { present: present ? 'Present' : 'Absent', time, name, idNumber, signatureData };
        records.push(record);
        displayMessage(`Attendance marked as ${record.present} for ${record.name} at ${time}`);
        displayRecords();
    }

    // Function to display records
    function displayRecords() {
        recordsDiv.innerHTML = '<ul>' + records.map(record => `
            <li>
                <strong>${record.name}</strong> (${record.present}) at ${record.time}
                ${record.signatureData ? `<br><img src="${record.signatureData}" alt="Signature" style="width:100px;height:30px;border:1px solid #000;">` : ''}
            </li>
        `).join('') + '</ul>';
    }

    // Function to display messages
    function displayMessage(message) {
        messageDiv.textContent = message;
        setTimeout(() => {
            messageDiv.textContent = '';
        }, 3000);
    }

    // Event listener for form submission
    attendanceForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const present = presentRadio.checked;
        const name = document.getElementById('name').value;
        const idNumber = document.getElementById('idNumber').value;
        if (present) {
            const signatureData = signatureCanvas.toDataURL();
            markAttendance(true, name, idNumber, signatureData);
        } else {
            markAttendance(false, name, idNumber);
        }
        attendanceForm.reset();
        toggleDetails();
        ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
    });

    // Event listener for downloading records
    downloadBtn.addEventListener('click', () => {
        if (records.length === 0) {
            displayMessage('No records to download.');
            return;
        }

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(records.map(record => ({
            Name: record.name,
            'ID Number': record.idNumber,
            Presence: record.present,
            DateandTime: record.time,
        })));
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
        XLSX.writeFile(wb, 'attendance.xlsx');
    });
});
