import { Component, OnInit } from '@angular/core';
import { Faq } from '../../shared/models/faq.model';
import { FaqService } from '../../shared/services/faq.service';

/**
 * GYIK (Gyakran Ismételt Kérdések) komponens.
 * Betölti és megjeleníti az adatbázisból származó kérdés-válasz párokat.
 * Egy válasz egyszerre jelenik meg (accordion stílus).
 */
@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
  standalone: false
})
export class FaqComponent implements OnInit {

  /**
   * A betöltött GYIK kérdés-válasz lista.
   */
  faqs: Faq[] = [];

  /**
   * Az éppen kibontott kérdés indexe.
   * Ha `null`, nincs kibontva semmi.
   */
  expandedIndex: number | null = null;

  constructor(private faqService: FaqService) {}

  /**
   * Inicializáláskor betölti az összes GYIK elemet Firestore-ból ABC sorrendben.
   */
  ngOnInit(): void {
    this.faqService.getFaqs().subscribe(data => {
      this.faqs = data.sort((a, b) => a.question.localeCompare(b.question));
    });
  }
  
  /**
   * Kattintásra nyitja vagy zárja az adott indexű kérdést.
   * @param index Az adott kérdés indexe
   */
  toggle(index: number) {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }
}