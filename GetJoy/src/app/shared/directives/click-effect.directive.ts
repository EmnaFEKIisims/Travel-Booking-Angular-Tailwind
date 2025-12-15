import { Directive, ElementRef, Input, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appClickEffect]',
  standalone: true
})
export class ClickEffectDirective {
  @Input() appClickEffect: string = '#3b82f6';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  @HostListener('click', ['$event']) onClick(event: MouseEvent) {
    const button = this.el.nativeElement;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const ripple = this.renderer.createElement('span');
    this.renderer.setStyle(ripple, 'position', 'absolute');
    this.renderer.setStyle(ripple, 'border-radius', '50%');
    this.renderer.setStyle(ripple, 'background', this.appClickEffect);
    this.renderer.setStyle(ripple, 'transform', 'scale(0)');
    this.renderer.setStyle(ripple, 'animation', 'ripple 600ms linear');
    this.renderer.setStyle(ripple, 'left', (x - 10) + 'px');
    this.renderer.setStyle(ripple, 'top', (y - 10) + 'px');
    this.renderer.setStyle(ripple, 'width', '20px');
    this.renderer.setStyle(ripple, 'height', '20px');
    this.renderer.setStyle(ripple, 'pointer-events', 'none');

    this.renderer.appendChild(button, ripple);

    setTimeout(() => {
      this.renderer.removeChild(button, ripple);
    }, 600);
  }
}
