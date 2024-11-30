export const parseCSVData = (csvText) => {
    // Split the CSV text into lines and remove any empty lines
    const lines = csvText.split('\n').filter(line => line.trim());

    // Get headers from first line
    const headers = lines[0].split(',').map(header => header.trim());

    // Parse remaining lines
    return lines.slice(1).map(line => {
        const values = line.split(',');
        const row = {};

        headers.forEach((header, index) => {
            row[header] = values[index] ? values[index].trim() : '';
        });

        return {
            id: parseInt(row.ID),
            month: parseInt(row.MONTH),
            year: parseInt(row.YEAR),
            latitude: parseFloat(row.LATITUDE),
            longitude: parseFloat(row.LONGITUDE),
            timestamp: new Date(parseInt(row.YEAR), parseInt(row.MONTH) - 1, 1)
        };
    }).filter(row =>
        !isNaN(row.latitude) &&
        !isNaN(row.longitude) &&
        !isNaN(row.year) &&
        !isNaN(row.month)
    );
};