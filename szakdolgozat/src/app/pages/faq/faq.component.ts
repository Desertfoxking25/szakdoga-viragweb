import { Component, OnInit } from '@angular/core';
import { Faq } from '../../shared/models/faq.model';
import { FaqService } from '../../shared/services/faq.service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
  standalone: false
})
export class FaqComponent implements OnInit {
  faqs: Faq[] = [];
  expandedIndex: number | null = null;

  constructor(private faqService: FaqService) {}

  ngOnInit(): void {
    this.faqService.getFaqs().subscribe(data => {
      this.faqs = data;
    });
  }
  
  toggle(index: number) {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }
}