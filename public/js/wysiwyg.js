class Wysiwyg{
    constructor(container, imageObj){
        this.container = container;
        console.log(this.container)
        this.name = this.container.getAttribute('field-name');
        this.inlineTags = [
            {
                tagName: 'STRONG',
                breakable: true
            },
            {
                tagName: 'EM',
                breakable: true
            },
            {
                tagName: 'B',
                breakable: true
            },
            {
                tagName: 'I',
                breakable: true
            },
            {
                tagName: 'A',
                breakable: false
                
            }
        ];
        this.elements = {};
        this.blocks = [];
        this.imageObj = imageObj;
        this.init();
    }
    init(){
        this.renderAndGetElements();
        this.addListeners();
        this.decodeValue();
    }
    renderAndGetElements(){
        this.wrapper = this.container.querySelector('.wysiwyg-blocks-wrapper');
        this.textarea = this.container.querySelector('textarea');
        this.elements.typeToolbar = document.createElement('DIV');
        this.elements.typeToolbar.className = 'wysiwyg-type-toolbar';
        this.elements.typeToolBold = document.createElement('A');
        this.elements.typeToolBold.className = 'wysiwyg-type-bold-button no-select btn';
        this.elements.typeToolBold.innerHTML = '<strong>B</strong>';
        this.elements.typeToolItalic = document.createElement('A');
        this.elements.typeToolItalic.className = 'wysiwyg-type-italic-button no-select btn';
        this.elements.typeToolItalic.innerHTML = '<em>I</em>';
        this.elements.typeToolbar.appendChild(this.elements.typeToolBold);
        this.elements.typeToolbar.appendChild(this.elements.typeToolItalic);
        this.elements.actionContainers = this.wrapper.querySelectorAll('.wysiwyg-action-container');
        this.container.insertBefore(this.elements.typeToolbar, this.container.firstChild);
    }
    addListeners(){
        for(let i = 0; i < this.elements.actionContainers.length; i++) 
            this.addActionListeners(this.elements.actionContainers[i]);
            
        this.elements.typeToolBold.addEventListener('click', function(){
            this.insertInlineTag('strong');
        }.bind(this));
        this.elements.typeToolItalic.addEventListener('click', function(){
            this.insertInlineTag('em');
        }.bind(this));
    }
    addActionListeners(container){
        let btns = container.querySelectorAll('.wysiwyg-action');
        let block = this.getAncestorByClass(container, 'wysiwyg-block');
        for(let i = 0; i < btns.length; i++) {
            let btn = btns[i];
            let action = btn.getAttribute('data-action');
            if(action == 'text')
                btn.addEventListener('click', function(){ this.addBlock(action, block); }.bind(this));
            else if(action == 'image')
                btn.addEventListener('click', function(){ this.popupImageSelector(block); }.bind(this));
            else if(action == 'remove')
                btn.addEventListener('click', function(){ this.removeBlock(block); }.bind(this));
            else if(action == 'expand')
                btn.addEventListener('click', function(){ this.toggleHiddenButtons(block); }.bind(this));
        }
    }
    addBlock(type, target, params){
        if(!type) return;
        let block = document.createElement('DIV');
        if(type == 'text') {
            block.className = 'wysiwyg-block wysiwyg-text-block';
            let editable = document.createElement('DIV');
            let blockClass = 'wysiwyg-element wysiwyg-editable';
            if(!params || !params.content) blockClass += ' empty';
            else editable.innerHTML = params.content;
            editable.className = blockClass;
            editable.setAttribute('contenteditable', true);
            block.appendChild(editable);
            editable.addEventListener('input', function(){
                if(editable.innerHTML == '') editable.classList.add('empty');
                else editable.classList.remove('empty');
            });
        } else if(type == 'image') {
            block.className = 'wysiwyg-block wysiwyg-figure-wrapper';
            block.innerHTML = '<figure class="wysiwyg-element wysiwyg-figure"><img class="wysiwyg-element wysiwyg-image" src="'+params.src+'"><textarea class="wysiwyg-element wysiwyg-caption" rows="1" placeholder="caption here...">'+params.caption+'</textarea></figure>';
        }

        let actionContainer = target.querySelector('.wysiwyg-action-container').cloneNode(true);
        actionContainer.querySelector('.block-options-container').classList.remove('viewing');
        block.appendChild(actionContainer);
        this.addActionListeners(actionContainer);

        if(target.nextElementSibling) {
            this.wrapper.insertBefore(block, target.nextElementSibling);
        }
        else this.wrapper.appendChild(block);
        if(this.wrapper.classList.contains('empty')) this.wrapper.classList.remove('empty');
        if(target.classList.contains('wysiwyg-placeholder-block')) target.querySelector('.block-options-container').classList.remove('viewing');
        return block;
    }
    removeBlock(block) {
        let blockWrapper = this.getAncestorByClass(block, 'wysiwyg-blocks-wrapper');
        block.remove();
        if(blockWrapper.querySelectorAll('.wysiwyg-action-container').length == 1) blockWrapper.classList.add('empty');
    }
    popupImageSelector(target){
        document.body.classList.add('viewing-media-container');
        document.addEventListener('keydown', function(event){
            if(event.keycode !== '27' || !document.body.classList.contains('viewing-media-container')) return;
            event.preventDefault();
            this.imageObj.closeImageSelector();
        });
        this.imageObj.elements.blocksWrapper = this.wrapper;
        this.imageObj.elements.currentBlock = target;
        this.imageObj.wysiwygObj = this;
    }
    getTextNodesWithRange(range, selection) {
        let output = [];
        let filter = {
            hasStarted: false,
            hasEnded: false,
            acceptNode: function(node){
                if(node == selection.anchorNode) {
                    if(this.hasStarted) {
                        this.hasEnded = true;
                        return  NodeFilter.FILTER_ACCEPT;
                    }
                    else this.hasStarted = true;
                }
                if(node == selection.focusNode) {
                    if(!this.hasStarted) {
                        this.hasStarted = true;
                    } else {
                        this.hasEnded = true;
                        return  NodeFilter.FILTER_ACCEPT;
                    }
                }
                return this.hasStarted && !this.hasEnded ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
        };
        let walk = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_TEXT, filter);
        let n;
        while(n = walk.nextNode()) output.push(n);
        return output;
    }
    replaceTextNodeWithInlineTag(node, tagName) {
        let replace = document.createElement(tagName);
        replace.textContent = node.textContent;
        node.parentNode.replaceChild(replace, node);
    }
    isAlreadyInTag(node, tagName){
        tagName = tagName.toUpperCase();
        if(node.nodeType == 1 && node.tagName.toUpperCase() == tagName) return node;
        let parent = node.parentNode;
        while(!parent.classList.contains('wysiwyg-editable')){
            if(parent.tagName.toUpperCase() == tagName) return parent;
            parent = parent.parentNode;
        }
        return null;
    }
    insertInlineTag(tagName, attr = null) {
        let selection = document.getSelection();
        if(selection.type != 'Range') return;
        let range = selection.getRangeAt(0);
        if(range.commonAncestorContainer.nodeType == 3) {
            /*
                selection begins and ends within the same text node
            */
            let startOffset = selection.anchorOffset < selection.focusOffset ? selection.anchorOffset : selection.focusOffset;
            let endOffset = selection.anchorOffset < selection.focusOffset ? selection.focusOffset : selection.anchorOffset;
            let target = range.commonAncestorContainer;
            if(this.isAlreadyInTag(target, tagName)) {
                /*
                    the text node is already in the added type of tag 
                    >>> remove the tag
                */
                target = this.isAlreadyInTag(target, tagName);
                if(target.children.length == 0) {
                    let txt = document.createTextNode(target.textContent.substring(startOffset, endOffset));
                    let tag = document.createElement(tagName);
                    tag.textContent = target.textContent.substring(0, startOffset);
                    target.textContent = target.textContent.substring(endOffset);
                    target.parentNode.insertBefore(tag, target);
                    target.parentNode.insertBefore(txt, target);
                } else {

                }
            } else {
                /*
                    the text node is not in the added type of tag
                    >>> add the tag
                */
                let tag = document.createElement(tagName);
                tag.textContent = target.textContent.substring(startOffset, endOffset);
                range.deleteContents();
                range.insertNode(tag);
                if(tag.nextElementSibling && tag.nextElementSibling.tagName.toUpperCase() == tagName){
                    tag.nextElementSibling.innerHTML = tag.innerText + tag.nextElementSibling.innerHTML;
                    tag.remove();
                }
                else if(tag.previousElementSibling && tag.previousElementSibling.tagName.toUpperCase() == tagName){
                    tag.previousElementSibling.innerHTML = tag.previousElementSibling.innerHTML + tag.innerText;
                    tag.remove();
                }
            }
        } else {
            /*
                selection begins and ends in different nodes
            */
            let temp = this.getTextNodesWithRange(range, selection);
            let textNodes = [];
            let allAlreadyInTag = true;
            for(let i = 0; i < temp.length ; i ++) {
                let isAlreadyInTag = this.isAlreadyInTag(temp[i], tagName);
                if(!isAlreadyInTag && allAlreadyInTag) allAlreadyInTag = false;
                let n = {
                    'node': temp[i],
                    'isAlreadyInTag': isAlreadyInTag
                };
                textNodes.push(n);
            }
            for(let i = 0; i < textNodes.length ; i ++) {
                if(i == 0) {
                    let offset = selection.anchorOffset;
                    if(textNodes[i]['isAlreadyInTag']) {
                        if(!allAlreadyInTag) continue;
                        let tag = textNodes[i]['node'].parentNode;
                        let temp = document.createElement(tag.tagName);
                        let parent = tag.parentNode;
                        if(offset == 0) {
                            parent.replaceChild(tag.firstChild, tag);
                            continue;
                        }
                        temp.textContent = textNodes[i]['node'].textContent.substring(0, offset);
                        tag.textContent = textNodes[i]['node'].textContent.substring(offset);
                        parent.insertBefore(temp, tag);
                        while(tag.tagName !== tagName.toUpperCase()) {
                            temp = document.createElement(parent.tagName);
                            temp.appendChild(tag);
                            parent.appendChild(temp);
                            tag = parent;
                            parent = tag.parentNode;
                        }
                        parent.replaceChild(tag.firstChild, tag);
                    } else {
                        let tag = document.createElement(tagName);
                        tag.textContent = textNodes[i]['node'].textContent.substring(offset);
                        textNodes[i]['node'].textContent = textNodes[i]['node'].textContent.substring(0, offset);
                        if(textNodes[i]['node'].nextSibling)
                            textNodes[i]['node'].parentNode.insertBefore(tag, textNodes[i]['node'].nextSibling);
                        else
                            textNodes[i]['node'].parentNode.appendChild(tag);
                    }
                } else if(i == textNodes.length - 1) {
                    let offset = selection.focusOffset;
                    if(textNodes[i]['isAlreadyInTag']) {
                        if(!allAlreadyInTag) continue;
                        let tag = textNodes[i]['node'].parentNode;
                        let temp = document.createElement(tag.tagName);
                        let parent = tag.parentNode;
                        tag.textContent = textNodes[i]['node'].textContent.substring(0, offset);
                        temp.textContent = textNodes[i]['node'].textContent.substring(offset);
                        if(temp.textContent.length == 0) {
                            parent.replaceChild(tag.firstChild, tag);
                            continue;
                        }
                        if(tag.nextSibling) parent.insertBefore(temp, tag.nextSibling);
                        else parent.appendChild(temp);
                        while(tag.tagName !== tagName.toUpperCase()) {
                            temp = document.createElement(parent.tagName);
                            temp.appendChild(tag);
                            if(parent.firstChild)
                                parent.insertBefore(temp, parent.firstChild);
                            else
                                parent.appendChild(temp);
                            tag = parent;
                            parent = tag.parentNode;
                        }
                        if(tag.firstChild)
                            parent.replaceChild(tag.firstChild, tag);
                        else
                            console.log(tag);
                    } else {
                        let tag = document.createElement(tagName);
                        let offset = textNodes[i]['node'] == selection.anchorNode ? selection.anchorOffset : selection.focusOffset;
                        tag.textContent = textNodes[i]['node'].textContent.substring(0, offset);
                        textNodes[i]['node'].textContent = textNodes[i]['node'].textContent.substring(offset);
                        textNodes[i]['node'].parentNode.insertBefore(tag, textNodes[i]['node']);
                    }
                } else {
                    if(textNodes[i]['isAlreadyInTag']) {
                        if(!allAlreadyInTag) continue;
                        let tag = textNodes[i]['isAlreadyInTag'];
                        for(let j = 0; j < tag.childNodes.length; j++)
                            tag.parentNode.insertBefore(tag.childNodes[j], tag);
                        tag.remove();
                    } else {
                        let tag = document.createElement(tagName);
                        tag.textContent = textNodes[i]['node'].textContent;
                        textNodes[i]['node'].parentNode.replaceChild(tag, textNodes[i]['node']);
                    }
                }
            }
        }
        if(!attr) return;
        for(let prop in attr)
            tag.setAttribute(prop, attr[prop]);
    }
    getAncestorByClass(el, cls){
        if(el.classList.contains(cls)) return el;
        let target = el;
        do {
            target = target.parentNode;
            if(target === document.body) return null;
        } while(!target.classList.contains(cls))
            
        return target;
    }
    breakSelectionTextFromInlineTag(target, text, parent){
        if(!target) return;
    }
    toggleHiddenButtons(container){
        console.log('toggleHiddenButtons');
        let hiddenContainer = container.querySelector('.block-options-container');
        hiddenContainer.classList.toggle('viewing');
    }
    divToBr(str){
        /*
            1. collapse opening tags at the very beginning 
             /^(?:<div>)+/g => ''

            2. collapse closing tags at the very end
            /(?:<\/div>)+$/g => ''
            
            3. collapse closing tags that follow br
            /<br>(?:<\/div>)+/g => '<br>'

            4. replace the tag groups containg one or more tags with br
            /(?:<div>|<\/div>)+/g => '<br>'                
        */
        let output = str;
        let search = [
            {
                'pattern': /^(?:<div>)+/g,
                'replacement': ''
            },
            {
                'pattern': /(?:<\/div>)+$/g,
                'replacement': ''
            },
            {
                'pattern': /<br>(?:<\/div>)+/g,
                'replacement': '<br>'
            },
            {
                'pattern': /(?:<div>|<\/div>)+/g,
                'replacement': '<br>'
            }
        ];
        for(let i = 0; i <  search.length; i++)
            output = output.replaceAll(search[i]['pattern'], search[i]['replacement']);
        return output;
    }
    setValue(){
        let blocks = this.container.querySelectorAll('.wysiwyg-block');
        let val = '';
        for(let i = 0; i < blocks.length; i++) {
            let b = blocks[i];
            if(b.classList.contains('wysiwyg-text-block')) {
                val += '<!-- wysiwyg_section_text -->\n<p class="wysiwyg-element wysiwyg-text">' + this.divToBr(b.querySelector('.wysiwyg-editable').innerHTML) + '</p>\n<!-- wysiwyg_section_end -->';
            }
            else if(b.classList.contains('wysiwyg-figure-wrapper')) {
                let src = b.querySelector('.wysiwyg-image').src;
                let caption = b.querySelector('.wysiwyg-caption').value;
                val += '<!-- wysiwyg_section_figure -->\n<figure class="wysiwyg-element wysiwyg-figure"><img class="wysiwyg-element wysiwyg-image" src="'+src+'"><figcaption class="wysiwyg-element wysiwyg-caption">'+caption+'</figcaption></figure>\n<!-- wysiwyg_section_end -->';
            }
            
        }
        if(val) val = '\n' + val;
        this.textarea.value = val;
    }
    decodeValue(){
        let value = this.textarea.value;
        if(!value) return;
        let pattern = /<\!\-\-\swysiwyg_section_(.*?)\s\-\->(?:\r|\n|\s)*(.*?)(?:\r|\n|\s)*<\!\-\-\swysiwyg_section_end\s\-\->/g;
        let matches = [...value.matchAll(pattern)];
        let previousBlock = this.container.querySelector('.wysiwyg-placeholder-block');
        for(let i in matches) {
            let type = matches[i][1]; 
            if(type == 'text') {
                let params = this.decodeWysiwygText(matches[i][2]);
                console.log(params);
                previousBlock = this.addBlock('text', previousBlock, params);
            }
            else if(type == 'figure'){
                let params = this.decodeWysiwygFigure(matches[i][2]);
                previousBlock = this.addBlock('image', previousBlock, params);
            }
        }
    }
    decodeWysiwygText(str) {
        let pattern = /<p(?:\s.*?)?>(.*?)<\/p>/;
        let output = str.match(pattern)[1];
        return { 'content': output};
    }
    decodeWysiwygFigure(str) {
        let pattern_src = /<img\s.*?\ssrc\s*?=\s*?\"(.*?)\".*?>.*?/;
        let pattern_caption = /<figcaption(?:\s.*?)?>(.*?)<\/figcaption>/;
        let caption = str.match(pattern_caption);
        caption = caption ? caption[1] : '';
        console.log();
        let output = {
            'src': str.match(pattern_src)[1],
            'caption': caption
        }
        console.log(output);
        return output;
    }
}