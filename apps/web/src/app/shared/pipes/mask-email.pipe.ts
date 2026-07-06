import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maskEmail',
  standalone: true,
})
export class MaskEmailPipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    if (!value) return '';
    const parts = value.split('@');
    if (parts.length !== 2) return value;

    const [local, domain] = parts;
    if (local.length <= 2) {
      return `${local}***@${domain}`;
    }
    // Masks middle characters leaving first and last characters visible
    return `${local[0]}${local[1]}***${local[local.length - 1]}@${domain}`;
  }
}
