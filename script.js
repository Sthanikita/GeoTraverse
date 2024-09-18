document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('traverseForm');
    const legBody = document.getElementById('legBody');
    const resultBody = document.getElementById('resultBody');
    const numLegsInput = document.getElementById('numLegs'); // Input field for number of legs
    const updateButton = document.getElementById('updateButton'); // Button to update the table

    // Function to generate rows for traverse legs input
    function generateLegRows(numLegs) {
        legBody.innerHTML = ''; // Clear previous rows
        for (let i = 0; i < numLegs - 1; i++) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>Leg ${i + 1}</td>
                <td><input type="number" step="any" name="distance" required></td>
                <td><input type="number" step="any" name="bearing" required></td>
            `;
            legBody.appendChild(row);
        }
    }

    // Event listener for the update button
    updateButton.addEventListener('click', () => {
        const numLegs = parseInt(numLegsInput.value, 10);
        if (isNaN(numLegs) || numLegs < 2) {
            alert('Please enter a valid number of legs (at least 2).');
            return;
        }
        generateLegRows(numLegs);
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        // Get the input values for interior angles
        const measuredAngles = document.getElementById('measuredAngles').value.split(',').map(Number);
        const numLegs = parseInt(numLegsInput.value, 10);
        const polygonSum = (2 * numLegs - 4) * 900; // Theoretical sum of interior angles
        const totalMeasuredAngles = measuredAngles.reduce((acc, angle) => acc + angle, 0);
        const angleError = totalMeasuredAngles - polygonSum;
        const angleCorrection = angleError / numLegs;

        // Correct the interior angles
        const correctedAngles = measuredAngles.map(angle => angle - angleCorrection);

        // Get input values for distances and bearings
        const formData = new FormData(form);
        const distances = formData.getAll('distance').map(Number);
        const bearings = formData.getAll('bearing').map(Number);

        // Get initial Easting, Northing, and RL values
        const initialEasting = parseFloat(document.getElementById('initialE').value);
        const initialNorthing = parseFloat(document.getElementById('initialN').value);
        const initialRL = parseFloat(document.getElementById('initialRL').value);
        const heightOfInstrument = parseFloat(document.getElementById('heightOfInstrument').value);
        const targetHeight = parseFloat(document.getElementById('targetHeight').value);

        // Compute forward bearing, Easting, Northing differences, and apply Bowditch’s rule
        let totalEastingDiff = 0, totalNorthingDiff = 0;
        let perimeter = 0;

        let currentEasting = initialEasting;
        let currentNorthing = initialNorthing;
        let currentRL = initialRL;

        resultBody.innerHTML = ''; 

        for (let i = 0; i < distances.length; i++) {
            const d = distances[i];
            const β = bearings[i];
            const deltaE = d * Math.sin((β * Math.PI) / 180);
            const deltaN = d * Math.cos((β * Math.PI) / 180);

            totalEastingDiff += deltaE;
            totalNorthingDiff += deltaN;
            perimeter += d;

            // Compute R.L. for the forward station
            const deltaH = d * Math.tan((β * Math.PI) / 180);
            const forwardRL = currentRL + deltaH + heightOfInstrument - targetHeight;

            // Apply correction
            const correctedEasting = currentEasting + deltaE;
            const correctedNorthing = currentNorthing + deltaN;

            // Display the corrected values
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>Station ${i + 1}</td>
                <td>${correctedEasting.toFixed(3)}</td>
                <td>${correctedNorthing.toFixed(3)}</td>
                <td>${forwardRL.toFixed(3)}</td>
            `;
            resultBody.appendChild(row);

            // Update for the next station
            currentEasting = correctedEasting;
            currentNorthing = correctedNorthing;
            currentRL = forwardRL;
        }

        // Apply Bowditch correction for total error in Easting/Northing
        const totalEastingError = totalEastingDiff;
        const totalNorthingError = totalNorthingDiff;

        for (let i = 0; i < distances.length; i++) {
            const legLength = distances[i];
            const eastingCorrection = (totalEastingError * legLength) / perimeter;
            const northingCorrection = (totalNorthingError * legLength) / perimeter;
            
        
        }
    });


    generateLegRows(4); 
});
