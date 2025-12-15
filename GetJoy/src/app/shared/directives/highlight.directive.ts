import { Directive, ElementRef, Renderer2, OnInit } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective implements OnInit {
  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.renderer.setStyle(this.el.nativeElement, 'background-color', '#fef3c7');
    this.renderer.setStyle(this.el.nativeElement, 'padding', '8px');
    this.renderer.setStyle(this.el.nativeElement, 'border-radius', '6px');
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'all 0.3s ease');
  }
}
