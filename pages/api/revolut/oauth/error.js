export default function handler(req, res) {
    res.status(200).json({
        status: 'error',
        message: 'API activation failed',
        timestamp: new Date().toISOString()
    });
} 