const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/projects/all
router.get('/all', (req, res) => {
  const query = 'SELECT * FROM projects';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching projects:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(results);
  });
});


// GET /api/projects/country/kenya
router.get('/country/kenya', (req, res) => {
  const query = `
    SELECT 
      \`ProjectID\`,
      \`Project Title\`,
      \`Approval Status\`,
      \`Fund\`,
      \`PAG Value\`,
      \`Start Date\`,
      \`End Date\`,
      \`Country(ies)\`,
      \`Lead Org Unit\`,
      \`Theme(s)\`,
      \`Donor(s)\`,
      \`Total Expenditure\`,
      \`Total Contribution\`,
      \`Total Contribution - Total Expenditure\`,
      \`Total PSC\`
    FROM projects
    WHERE \`Country(ies)\` LIKE '%Kenya%'
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching Kenyan projects:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(results);
  });
});


// GET /api/projects/approval-status/approved
router.get('/approval-status/approved', (req, res) => {
  const query = `
    SELECT 
      \`ProjectID\`,
      \`Project Title\`,
      \`Approval Status\`,
      \`Fund\`,
      \`PAG Value\`,
      \`Start Date\`,
      \`End Date\`,
      \`Country(ies)\`,
      \`Lead Org Unit\`,
      \`Theme(s)\`,
      \`Donor(s)\`,
      \`Total Expenditure\`,
      \`Total Contribution\`,
      \`Total Contribution - Total Expenditure\`,
      \`Total PSC\`
    FROM projects
    WHERE \`Approval Status\` = 'Approved'
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching approved projects:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(results);
  });
});


// POST /api/projects/create
router.post('/create', (req, res) => {
  const project = req.body;
  const query = `INSERT INTO projects SET ?`;
  db.query(query, project, (err, result) => {
    if (err) return res.status(500).json({ error: 'Insert failed' });
    res.json({ id: result.insertId, ...project });
  });
});


// GET /api/projects/view/:id
router.get('/view/:id', (req, res) => {
  db.query('SELECT * FROM projects WHERE ProjectID = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Fetch failed' });
    res.json(result[0]);
  });
});

// PUT /api/projects/update/:id
router.put('/update/:id', (req, res) => {
  db.query('UPDATE projects SET ? WHERE ProjectID = ?', [req.body, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Update failed' });
    res.json({ message: 'Updated successfully' });
  });
});


// DELETE /api/projects/delete/:id
router.delete('/delete/:id', (req, res) => {
  db.query('DELETE FROM projects WHERE ProjectID = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Delete failed' });
    res.json({ message: 'Deleted successfully' });
  });
});


// GET /api/projects/by-country
router.get('/by-country', (req, res) => {
  const query = `
    SELECT 
      \`Country(ies)\` AS country,
      COUNT(*) AS project_count
    FROM projects
    GROUP BY \`Country(ies)\`
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching projects by country:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(results);
  });
});

// GET /api/projects/by-org-unit
router.get('/by-org-unit', (req, res) => {
  const query = `
    SELECT 
      \`Lead Org Unit\` AS org_unit,
      COUNT(*) AS project_count
    FROM projects
    GROUP BY \`Lead Org Unit\`
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching projects by org unit:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(results);
  });
});

//curl http://localhost:5000/api/projects/by-theme
router.get('/by-theme', (req, res) => {
  const query = `
    SELECT 
      \`Theme(s)\` AS theme,
      COUNT(*) AS project_count
    FROM projects
    GROUP BY \`Theme(s)\`
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching projects by theme:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(results);
  });
});

module.exports = router;
