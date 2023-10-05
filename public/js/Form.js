class Form {
    constructor(form, wysiwygs){
        this.form = form;
        this.wysiwygs = wysiwygs;
        this.backUrl = location.pathname.replace(/(?:\/edit\/|\/add\/)/, '/browse/');
        console.log(this.backUrl);
        this.init();
    }
    init() {
        this.addListeners();
    }
    renderSuccessPage(response) {
        let div = document.createElement('DIV');
        let messsage = response.action == 'add' ? 'The record is added successfully.' : 'The record is updated successfully.';
        div.innerHTML = '<p>'+messsage+'</p><br><a href="'+this.backUrl+'">BACK</a>';
        this.form.parentNode.replaceChild(div, this.form);
    }
    renderErrorPage(response) {
        let div = document.createElement('DIV');
        let message = 'Something went wrong when ';
        message += response.action == 'add' ? 'adding' : 'updating';
        message += ' the record. Please try again';
        div.innerHTML = '<p>'+messsage+'</p><p>'+response.content+'</p><br><a href="'+backUrl+'">BACK</a>';
        this.form.parentNode.replaceChild(div, this.form);
    }
    addListeners(){
        this.form.addEventListener('submit', function(event){
            event.preventDefault();
            for(let i in this.wysiwygs) {
                this.wysiwygs[i].setValue();
            }
            
            let request = new XMLHttpRequest();
            let data = new FormData(this.form);
            request.onreadystatechange = function(){
                if(request.readyState == 4 && request.status == 200) {
                    let response = request.responseText;
                    console.log(response);
                    response = JSON.parse(response);
                    if(response['status'] == 'success')
                        this.renderSuccessPage(response);
                    else if(response['status'] == 'error')
                        this.renderErrorPage(response);
                }
            }.bind(this);
            request.open('POST', this.form.getAttribute('action'), true);
            request.send(data);
        }.bind(this));
    }
    
    
}