import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-tip-assistant',
  templateUrl: './tip-assistant.component.html',
  styleUrls: ['./tip-assistant.component.scss'],
  standalone: false
})
export class TipAssistantComponent implements AfterViewChecked {
  @Input() messages: { role: 'user' | 'assistant', content: string }[] = [];
  @Input() storageKey: string | null = null;
  @Output() messagesChange = new EventEmitter<{ role: 'user' | 'assistant'; content: string }[]>();
  @ViewChild('bottom') bottom!: ElementRef;

  userInput = '';
  isThinking = false;
  formatMessage(content: string): string {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')   // **félkövér**
      .replace(/(\*|_)(.*?)\1/g, '<em>$2</em>')           // *dőlt* vagy _dőlt_
      .replace(/\n/g, '<br>')                             // sortörés
      .replace(/\* /g, '<br>• ')                          // listaelemek
      .replace(/<\/strong><em>(.*?)<\/em><strong>/g, '<strong><em>$1</em></strong>'); // kombinált dőlt+félkövér (opcionális fix)
  }

  constructor(private http: HttpClient) {}

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    if (this.bottom) {
      this.bottom.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  sendMessage() {
    if (!this.userInput.trim() || this.isThinking) return;

    const userMsg = this.userInput.trim();
    this.messages.push({ role: 'user', content: userMsg });
    this.messagesChange.emit(this.messages);
    this.userInput = '';
    this.isThinking = true;

    this.http.post<any>('https://openrouter.ai/api/v1/chat/completions', {
      model: 'meta-llama/llama-4-maverick:free',
      messages: [
        { role: 'system', content: 'Egy segítőkész AI vagy, aki kertészeti tanácsokat ad.' },
        ...this.messages
      ]
    }, {
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json'
      }
    }).subscribe(res => {
      const fullText = res.choices[0].message.content;
      const reply = { role: 'assistant' as const, content: '' };
      this.messages.push(reply);
      this.messagesChange.emit(this.messages);

      let index = 0;
      const interval = setInterval(() => {
        if (index < fullText.length) {
          reply.content += fullText.charAt(index);
          this.messagesChange.emit(this.messages);
          index++;
        } else {
          clearInterval(interval);
          this.isThinking = false;
        }
      }, 10);
    }, err => {
      this.messages.push({ role: 'assistant', content: 'Hiba történt a válasz lekérésekor' });
      this.messagesChange.emit(this.messages);
      this.isThinking = false;
    });
  }

  clearChat() {
    this.messages.length = 0;
    this.messagesChange.emit(this.messages);
  }
}