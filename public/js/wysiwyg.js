class Wysiwyg{
    constructor(container){
        this.container = container;
        this.name = this.container.getAttribute('field-name');
        this.elements = {};
        this.init();
    }
    init(){
        this.renderAndGetElements();
        this.addListeners();
    }
    renderAndGetElements(){
        this.wrapper = this.container.querySelector('.wysiwyg-blocks-wrapper');
        this.elements.actions = this.container.querySelector('.wysiwyg-actions');
        console.log(this.elements.actions);
        this.elements.addText = document.createElement('BUTTON');
        this.elements.addText.className = 'wysiwyg-block-option-text wysiwyg-block-option';
        this.elements.addText.innerText = 'Text';
        this.elements.addImage = document.createElement('BUTTON');
        this.elements.addImage.className = 'wysiwyg-block-option-image wysiwyg-block-option';
        this.elements.addImage.innerText = 'Image';
        this.elements.actions.appendChild(this.elements.addText);
        this.elements.actions.appendChild(this.elements.addImage);
    }
    addListeners(){
        this.elements.addText.addEventListener('click', function(){ this.addBlock('text'); }.bind(this));
        this.elements.addImage.addEventListener('click', ()=>{this.addBlock('image')});
    }
    addBlock(type){
        if(!type) return;
        let element;
        if(type == 'text')
        {
            element = document.createElement('TEXTAREA');
            element.className = 'wysiwyg-element wysiwyg-textarea';
            element.name = this.name+'[]';
            element.setAttribute('rows', 1);
        }
        this.wrapper.appendChild(element);
    }
}
let wysiwyg_objs = [];
let sWysiwygContainer = document.getElementsByClassName('wysiwyg-container');
if(sWysiwygContainer.length)
{
    for(let i = 0; i < sWysiwygContainer.length; i++)
    {
       new Wysiwyg(sWysiwygContainer[i]);
    }
}