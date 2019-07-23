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
        # 'file': {
        #     'class': 'logging.FileHandler',
        #     'filename': 'data_layer/api/logs/airmate_api_logs.log',
        #     'mode': 'w',
        #     'formatter': 'detailed',
        # },
    },
    'loggers': {
        'Views': {
            'handlers': [ 'console'],
            'level': 'DEBUG'
        },
        'Postgres': {
            'handlers': ['console'],
            'level': 'DEBUG'
        },
        'BigchainDB': {
            'handlers': ['console'],
            'level': 'DEBUG'
        },
        'AqiCalculator': {
            'handlers': ['console'],
            'level': 'DEBUG'
        },
        'DataConverter': {
            'handlers': ['console'],
            'level': 'DEBUG'
        }
    },
    'root': {
        'level': 'DEBUG',
        'handlers': ['console']
    },
}
