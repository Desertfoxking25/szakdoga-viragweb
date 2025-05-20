import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/**
 * Egy AI-alapú kertészeti tanácsadó komponens.
 * A felhasználó kérdéseket írhat be, amelyekre a rendszer OpenRouter API-n keresztül válaszol.
 */
@Component({
  selector: 'app-tip-assistant',
  templateUrl: './tip-assistant.component.html',
  styleUrls: ['./tip-assistant.component.scss'],
  standalone: false
})
export class TipAssistantComponent implements AfterViewChecked {

  /**
   * A jelenlegi chatüzenetek listája (user és AI oldalról).
   */
  @Input() messages: { role: 'user' | 'assistant', content: string }[] = [];

  /**
   * Opcionális localStorage kulcs (külső komponens kezeli).
   */
  @Input() storageKey: string | null = null;

  /**
   * Esemény, amely új üzenetlista esetén kiváltódik (pl. mentéshez).
   */
  @Output() messagesChange = new EventEmitter<{ role: 'user' | 'assistant'; content: string }[]>();

  /**
   * Az utolsó chatüzenet DOM eleme (scrollhoz).
   */
  @ViewChild('bottom') bottom!: ElementRef;

  /** Felhasználói beviteli mező tartalma */
  userInput = '';

  /** AI gondolkodási állapot (válasz generálás alatt) */
  isThinking = false;

  constructor(private http: HttpClient) {}

  /**
   * Minden frissítés után automatikusan legörget a chat aljára.
   */
  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  /**
   * Görgetés a chat végére.
   */
  private scrollToBottom(): void {
    if (this.bottom) {
      this.bottom.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * A megadott üzenet formázása HTML-re (félkövér, dőlt, sortörés stb.).
   * @param content A nyers szöveg (markdown-jellegű)
   * @returns A formázott HTML szöveg
   */
  formatMessage(content: string): string {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')   // **félkövér**
      .replace(/(\*|_)(.*?)\1/g, '<em>$2</em>')           // *dőlt* vagy _dőlt_
      .replace(/\n/g, '<br>')                             // sortörés
      .replace(/\* /g, '<br>• ')                          // listaelemek
      .replace(/<\/strong><em>(.*?)<\/em><strong>/g, '<strong><em>$1</em></strong>'); // kombinált stílus fix
  }

  /**
   * Üzenet elküldése az OpenRouter AI endpointra.
   * A válasz karakterenként jelenik meg, mint egy gépelési animáció.
   */
  sendMessage() {
    if (!this.userInput.trim() || this.isThinking) return;

    const userMsg = this.userInput.trim();
    this.messages.push({ role: 'user', content: userMsg });
    this.messagesChange.emit(this.messages);
    this.userInput = '';
    this.isThinking = true;

    this.http.post<any>('https://us-central1-flowershop-szakdoga.cloudfunctions.net/api/chat', {
      model: 'meta-llama/llama-4-maverick:free',
      messages: [
        { role: 'system', content: 'Egy segítőkész AI vagy, aki kertészeti tanácsokat ad.' },
        ...this.messages
      ]
    }).subscribe(res => {
      const fullText = res.choices[0].message.content;
      const reply = { role: 'assistant' as const, content: '' };
      this.messages.push(reply);
      this.messagesChange.emit(this.messages);

      // Karakterenként gépelés-szerű megjelenítés
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

  /**
   * Teljes chat törlése.
   */
  clearChat() {
    this.messages.length = 0;
    this.messagesChange.emit(this.messages);
  }
}
