log_conf = {
    'version': 1,
    'formatters': {
        'detailed': {
            'class': 'logging.Formatter',
            'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        }
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'detailed',
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': 'airmate_api_logs.log',
            'mode': 'w',
            'formatter': 'detailed',
        },
    },
    'loggers': {
        'Views': {
            'handlers': ['file', 'console'],
            'level': 'DEBUG'
        },
        'Postgres': {
            'handlers': ['file', 'console'],
            'level': 'DEBUG'
        },
        'BigchainDB': {
            'handlers': ['file', 'console'],
            'level': 'DEBUG'
        },
        'AqiCalculator': {
            'handlers': ['file', 'console'],
            'level': 'DEBUG'
        },
        'DataConverter': {
            'handlers': ['file', 'console'],
            'level': 'DEBUG'
        }
    },
    'root': {
        'level': 'DEBUG',
        'handlers': ['console', 'file']
    },
}
