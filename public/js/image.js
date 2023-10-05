const image = {
    container: null, 
    request: null,
    fetchedNum: 0, 
    request: null,
    requestUrl: '/api/media',
    insertUrl: '/api/insert/media',
    mediaPath: '/media',
    filetypes: {
        'image': ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'],
        'audio': ['wav', 'mp3', 'webm'],
        'video': ['mp4', 'webm', 'mpg', 'mpeg', 'mov']
    },
    extensionToMediaType: {
        'wav': 'wav',
        'mp3': 'mpeg',
        'webm': 'webm',
        'mp4': 'mp4',
        'mpg': 'mpeg', 
        'mpeg': 'mpeg',
        'mov': 'quicktime'
    },
    elements: {
        wrappers: [],
        currentBlock: null
    },
    init: function(container){
        this.container = container;
        this.getElementsAndAddListeners();
        this.fetchMedia(30);
    },
    getElementsAndAddListeners: function(){
        this.elements.close = this.container.querySelector('#button-close-media-container');
        this.elements.close.addEventListener('click', this.closeImageSelector);
        this.elements.mediaFieldsContainer = this.container.querySelector("#media-fields-container");
        let w = this.container.querySelector(".media-field-wrapper");
        let input = w.querySelector('input.media-field');
        input.addEventListener('change', this.postFileSelected.bind(this));
        this.elements.wrappers.push(this.container.querySelector(".media-field-wrapper"));
        this.elements.wrapperTemplate = this.elements.wrappers[0].cloneNode(true);
        this.elements.previewContainer = this.container.querySelector("#media-preview-container");
        this.elements.form = this.container.querySelector('#media-form');
        this.elements.form.addEventListener('submit', this.submit.bind(this));
        this.wysiwygObj = null;
    },
    closeImageSelector: function(){
        document.body.classList.remove('viewing-media-container');
    },
    fetchMedia: function(num){
        this.request = new XMLHttpRequest()
        let offset = this.fetchedNum;
        this.request.onreadystatechange = function(){
            if(this.request.readyState == 4 && this.request.status == 200)
            {
                let response = JSON.parse(this.request.responseText);
                let media = response['content'];
                console.log(media.length);
                for(let i = 0; i < media.length; i++)
                    this.renderPreview(media[i]);
                this.fetchedNum += media.length;
                this.container.classList.remove('waiting');
                this.request = null;
            }
        }.bind(this);
        this.request.open('GET', this.requestUrl + '?num=' + num + '&offset=' + offset);
        this.request.send();
        
    },
    renderPreview: function(m){
        if(!this.container) return;
        let m_type = this.checkMediaType(m.type);
        if(!m_type) return;
        
        let src = this.mediaPath + '/' + m.filename + '.' + m.type;
        let caption = '';
        let wrapper = document.createElement('DIV');
        wrapper.className = 'media-preview-wrapper';
        let html = '<figure>';
        switch (m_type){
            case 'image': 
                html += '<img src="'+src+'">';
                break;
            case 'audio':
                html += '<audio controls><source src="'+src+'" type="audio/'+extensionToMediaType[m.type]+'"></source></audio>';
                break;
            case 'video':
                html += '<video controls><source src="'+src+'" type="video/'+extensionToMediaType[m.type]+'"></source></video>';
                break;
        }
        html += m.caption ? '<figcaption>' + m.caption + '</figcaption>' : '';
        html += '</figure>';
        wrapper.innerHTML = html;
        this.elements.previewContainer.appendChild(wrapper);
        wrapper.addEventListener('click', function(){
            let params = { 'src': src, 'caption': caption};
            this.wysiwygObj.addBlock('image', this.elements.currentBlock, params);
        }.bind(this));
    },
    checkMediaType: function(t){
        for(c in this.filetypes)
        {
            if( this.filetypes[c].includes(t) )
                return c;
        }
        return 0;
    },
    addMediaField: function(){
        let w = this.elements.wrapperTemplate.cloneNode(true);
        let input = w.querySelector('input.media-field');
        input.addEventListener('change', this.postFileSelected.bind(this));
        this.elements.wrappers.push(w);
        let idx = this.elements.wrappers.length;
        w.setAttribute('idx', idx);
        w.querySelector('input').id = 'media-field-' + idx;
        w.querySelector('label').setAttribute('for', 'media-field-' + idx);
        this.elements.mediaFieldsContainer.insertBefore(w, this.elements.mediaFieldsContainer.firstChild);
    },
    postFileSelected: function(event){
        let el = event.target;
        let wrapper = el.parentElement.parentElement;
        let preview = wrapper.querySelector('img');
        let textarea = wrapper.querySelector('textarea');
        let self = this;
        if (el.files && el.files[0]) {
            preview.onload = function(){
                wrapper.setAttribute("data-state", "selected");
                URL.revokeObjectURL(this.src);
                textarea.disabled = false;
                self.addMediaField();
            }
            preview.src = URL.createObjectURL(el.files[0])
        }
    },
    submit: function(event){
        event.preventDefault();
        this.request = new XMLHttpRequest();
        this.request.onreadystatechange = function(){
            if(this.request.readyState == 4 && this.request.status == 200)
            {
                let response = JSON.parse(this.request.responseText);
                if(response['status'] == 'success') alert('The files are uploaded successfully!');
            }
        }.bind(this)
        this.request.open('POST', this.insertUrl, true);
        let data = new FormData(event.target);
        this.request.send(data);
    }
}
let imagesContainer = document.getElementById('media-container');
image.init(imagesContainer);