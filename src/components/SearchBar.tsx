import { IconButton, Input, InputGroup } from '@chakra-ui/react'
import { CloseIcon, SearchIcon } from './icons'

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = 'Search cards…' }: SearchBarProps) {
  return (
    <InputGroup
      maxW={{ base: 'full', md: 'sm' }}
      startElement={<SearchIcon />}
      startElementProps={{ color: 'fg.muted' }}
      endElement={
        value ? (
          <IconButton
            size="2xs"
            variant="ghost"
            aria-label="Clear search"
            onClick={() => onChange('')}
          >
            <CloseIcon />
          </IconButton>
        ) : undefined
      }
    >
      <Input
        size="sm"
        value={value}
        placeholder={placeholder}
        aria-label="Search cards"
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') onChange('')
        }}
      />
    </InputGroup>
  )
}
