import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit: number = 100, completeWords: boolean = false, ellipsis: string = '...'): string {
    if (!value) return '';
    
    if (value.length <= limit) return value;
    
    if (completeWords) {
      const words = value.substr(0, limit).split(' ');
      words.pop();
      return words.join(' ') + ellipsis;
    }
    
    return value.substr(0, limit) + ellipsis;
  }
}
