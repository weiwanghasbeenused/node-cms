const config = {
    vars: ['name1', 'deck', 'body', 'notes', 'rank', 'begin', 'end', 'media'],
    fields: {
        name1: {
            'display': 'Name',
            'element': 'input',
            'type': 'text'
        },
        deck: {
            'display': 'Synopsis',
            'element': 'textarea'
        },
        body: {
            'display': 'Body',
            'element': 'textarea'
        },
        notes: {
            'display': 'Notes',
            'element': 'textarea'
        },
        rank: {
            'display': 'Rank',
            'element': 'input',
            'type': 'number'
        },
        begin: {
            'display': 'Begin',
            'element': 'input'
        },
        end: {
            'display': 'End',
            'element': 'input'
        },
        media: {
            'display': 'End',
            'element': 'input'
        }
    }
}

module.exports = config;