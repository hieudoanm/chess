#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct Square {
    pub file: u8,
    pub rank: u8,
}

impl Square {
    pub const fn new(file: u8, rank: u8) -> Option<Self> {
        if file < 8 && rank < 8 {
            Some(Square { file, rank })
        } else {
            None
        }
    }

    pub const fn index(self) -> usize {
        (self.rank * 8 + self.file) as usize
    }

    pub fn from_index(index: usize) -> Option<Self> {
        if index < 64 {
            Some(Square {
                file: (index % 8) as u8,
                rank: (index / 8) as u8,
            })
        } else {
            None
        }
    }

    pub fn from_san(san: &str) -> Option<Self> {
        let bytes = san.as_bytes();
        if bytes.len() != 2 {
            return None;
        }
        let file = bytes[0] as char;
        let rank = bytes[1] as char;
        if !('a'..='h').contains(&file) || !('1'..='8').contains(&rank) {
            return None;
        }
        Square::new(file as u8 - b'a', rank as u8 - b'1')
    }

    pub fn to_san(self) -> String {
        format!(
            "{}{}",
            (b'a' + self.file) as char,
            (b'1' + self.rank) as char
        )
    }
}

impl std::fmt::Display for Square {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.to_san())
    }
}

impl Default for Square {
    fn default() -> Self {
        Square::new(0, 0).unwrap()
    }
}
