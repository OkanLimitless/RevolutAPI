export default function handler(req, res) {
    res.status(200).json({
        status: 'success',
        message: 'API activation successful',
        timestamp: new Date().toISOString()
    });
} 