// import { sendAndReceiveOutput } from './your_script.js';


document.addEventListener('DOMContentLoaded', function() {
    
    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#spam').addEventListener('click', () => load_mailbox('spam'));
    document.querySelector('#compose').addEventListener('click', compose_email);
    document.querySelector('#compose-form').addEventListener('submit', send_email);
  
    // By default, load the inbox
    load_mailbox('inbox');
});
  




function compose_email() {
    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
  
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
}
  
  

function load_mailbox(mailbox) {
    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';  
    document.querySelector('#compose-view').style.display = 'none';
  
    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
    // GET /emails/<str:mailbox>
    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
        console.log(emails);
        
        emails.forEach(email => {
        //    let output =  sendAndReceiveOutput(email.body);
        //    let parsedOutput = JSON.parse(output);

        //    if (parsedOutput.is_true){
            if (mailbox == 'inbox') {
                if (email.read) {
                    is_read = 'read';
                } else {
                    is_read = 'unread';
                }
            } else {
                is_read = 'unread';
            }
            // else{
            //     if (mailbox == 'inbox') {
            //         if (email.read) {
            //             is_read = 'read';
            //         } else {
            //             is_read = 'unread';
            //         }
            //     } else {
            //         is_read = 'unread';

            // }}
            
            let div = document.createElement('div');
            div.className = `card my-1 items`;
            if (email.body.length <= 99) {
                div.innerHTML = `
                    <div class='card ${is_read}'>
                        <div class='card-header ${is_read}'>
                            <strong>${email.subject}</strong>
                        </div>
                        <div class='card-body ${is_read}' id='item-${email.id}'>
                            <p class='card-title'>
                                <strong>From:</strong> <strong>From:</strong> <strong><span class='text-info'>${email.sender}</span></strong> &nbsp; |  &nbsp; 
                                <strong>To:</strong> <strong>From:</strong> <strong><span class='text-info'>${email.recipients}</span></strong> &nbsp; |  &nbsp;  
                                <strong>Date:</strong> ${email.timestamp}
                            </p>
                            <p class='card-text'>
                                ${email.body.slice(0, 99)}
                            </p>
                            <a href='#' class='btn btn-primary'>
                                <i class='fas fa-book-reader'></i> Read
                            </a>
                        </div>
                    </div>
                `;
            } else {
                div.innerHTML = `
                    <div class='card ${is_read}'>
                        <div class='card-header ${is_read}'>
                            <strong>${email.subject}</strong>
                        </div>
                        <div class='card-body ${is_read}' id='item-${email.id}'>
                            <p class='card-title'>
                                <strong>From:</strong> <strong><span class='text-info'>${email.sender}</span></strong> &nbsp; |  &nbsp;
                                <strong>To:</strong> <strong><span class='text-info'>${email.recipients}</span></strong> &nbsp; |  &nbsp;
                                <strong>Date:</strong> ${email.timestamp}
                            </p>
                            <p class='card-text'>
                                ${email.body.slice(0, 99)} <a href='#'>(more...)</a>
                            </p>
                            <a href='#' class='btn btn-primary'>
                                <i class='fas fa-book-reader'></i> Read
                            </a>
                        </div>
                    </div>
                `;
            }
            
            document.querySelector('#emails-view').appendChild(div);
            div.addEventListener('click', () => {
                view_email(email.id, mailbox);
            });
        });
    })  
}
  
  

function view_email(email_id, mailbox) {
    // GET /emails/<int:email_id>
    fetch(`/emails/${email_id}`)
    .then(response => response.json())
    .then(email => {
        document.querySelector('#emails-view').innerHTML = '';
        let div = document.createElement('div');
        div.className = `card my-1 items`;
        div.innerHTML = `
            <div class='card'>
                <div class='card-header'>
                    <strong>${email.subject}</strong>
                </div>
                <div class='card-body' id='item-${email.id}'>
                    <p class='card-title'>
                        <strong>From:</strong> <strong><span class='text-info'>${email.sender}</span></strong> &nbsp; |  &nbsp; <strong>To: </strong> <strong><span class='text-info'>${email.recipients}</span></strong> &nbsp; |  &nbsp; <strong>Date:</strong> ${email.timestamp} 
                        <br>
                    </p>
                    <p class='card-text'>
                        <strong>Message:</strong> <br>
                        ${email.body}
                    </p>
                </div>
            </div>
        `;
        
        document.querySelector('#emails-view').appendChild(div);
        if (mailbox == 'sent') return;
        
        let spamBtn = document.createElement('btn');
        spamBtn.className = `btn btn-warning my-2`;
        spamBtn.addEventListener('click', () => {
            spamNotspam(email_id, email.spam);
            if (spamBtn.innerText == 'spam') {
                spamBtn.innerText = 'not spam';
            } else {
                spamBtn.innerText = 'spam';
            }
        });
        if (!email.spam) {
            spamBtn.innerHTML = `<i class='fas fa-folder-open'></i> spam`;
        } else {
            spamBtn.innerHTML = `<i class='fas fa-folder'></i> not spam`;
        }
        document.querySelector('#emails-view').appendChild(spamBtn);
        
        
        
        let replyBtn = document.createElement('btn');
        replyBtn.className = `btn btn-success my-2`;
        replyBtn.style.cssText = 'margin-left: 15px';
        replyBtn.innerHTML = `<i class='fas fa-reply'></i> Reply`;
        replyBtn.addEventListener('click', () => {
            reply(email.sender, email.subject, email.body, email.timestamp);
        });
        document.querySelector('#emails-view').appendChild(replyBtn);
        read(email_id);
    });
}

  
  
/**
 * POST /emails
 */
function send_email() {
    event.preventDefault();
    
    // POST /emails
    fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: document.querySelector('#compose-recipients').value,
            subject: document.querySelector('#compose-subject').value,
            body: document.querySelector('#compose-body').value
        })
    })
    .then(response => response.json())
    .then(result => {
        localStorage.clear();
        load_mailbox('sent');
    })
}
  
  

function spamNotspam(email_id, state) {
    // PUT /emails/<int:email_id>
    fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            spam: !state
        })
    })
    .then(response => load_mailbox('inbox'));
}
  


function reply(sender, subject, body, timestamp) {
    compose_email();
  
    if (!/^Re:/.test(subject)) {
        subject = `Re: ${subject}`;
    }
  
    document.querySelector('#compose-recipients').value = sender;
    document.querySelector('#compose-subject').value = subject;
  
    pre_fill = `On ${timestamp} ${sender} wrote:\n${body}\n`;
  
    document.querySelector('#compose-body').value = pre_fill;
}
  
  

function read(email_id) {
    // PUT /emails/<int:email_id>
    fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
    });
}

//The code fetches data from the Django backend, particularly email-related information,
// and dynamically updates the UI to display this information. 
//This is a common pattern in single-page applications where data 
//is fetched asynchronously and then rendered on the page without a full reload.

//dynamic user interface ,
//to handle api fetch command 
//fetching and displaying data
//ui rendering 
// real time updates
//supports django backend